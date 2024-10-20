window.onload = () => {
    const url_arr = document.location.href.split("/");
    if (url_arr[url_arr.length - 1] !== "campusTour") {
        url_arr.pop();
    }
    document.location.url = url_arr.join("/") + "/";

    const inputField = document.getElementById('endSentenceInput');
    inputField.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            await checkSentence();
        }
    });

    function pxToVh(px) {
        return px / document.documentElement.clientHeight * 100;
    }

    function pxToVw(px) {
        return px / document.documentElement.clientWidth * 100;
    }

    function valueOfUnitString(unitString) {
        const unitStringRegex = /([0-9.]+)([a-z%]+)/i;
        return parseFloat(unitStringRegex.exec(unitString)[1]);
    }

    const images = Array.from(document.querySelectorAll('#decoration img'));
    const button = document.querySelector('#showPopupButton');
    const placedImages = [{
        top: pxToVh(valueOfUnitString(window.getComputedStyle(button).top)),
        left: pxToVw(valueOfUnitString(window.getComputedStyle(button).left)),
        width: pxToVw(valueOfUnitString(window.getComputedStyle(button).width)),
        height: pxToVh(valueOfUnitString(window.getComputedStyle(button).height))
    }];

    function isColliding(image) {
        return placedImages.some(img => Math.abs(img.top - image.top) < img.height + image.height && Math.abs(img.left - image.left) < img.width + image.width)
    }

    const edgeCount = [Math.ceil(images.length / 4), Math.floor(images.length / 4), Math.floor(images.length / 4), Math.round(images.length / 4)]

    images.forEach(image => {
        let edge, position, newImage;
        let iterations = 0;
        do {
            do {
                edge = Math.floor(Math.random() * 4);
            } while (edgeCount[edge] === 0);
            position = 1 + Math.random() * 98;
            newImage = {top: 0, left: 0, width: pxToVw(image.width), height: pxToVh(image.height)};

            switch (edge) {
                case 0: // Top edge
                    newImage.top = 1;
                    newImage.left = position;
                    break;
                case 1: // Right edge
                    newImage.top = position;
                    newImage.left = 99 - pxToVw(image.width);
                    break;
                case 2: // Bottom edge
                    newImage.top = 99 - pxToVh(image.height);
                    newImage.left = position;
                    break;
                case 3: // Left edge
                    newImage.top = position;
                    newImage.left = 1;
                    break;
            }
            iterations++;
        } while (isColliding(newImage) && iterations < 100);
        if (iterations === 100) {
            image.style.display = 'none';
            console.info(`Image ${image.src.split("/").pop()} could not be placed`);
        } else {

            edgeCount[edge]--;
            placedImages.push(newImage);

            image.style.top = newImage.top + "vh";
            image.style.left = newImage.left + "vw";
        }
    });
};

function closePopupOnClickOutside(event) {
    const popup = document.getElementById('popup');
    const button = document.getElementById('showPopupButton');

    if (!popup.contains(event.target) && !button.contains(event.target)) {
        closePopup();
    }
}

function showPopup() {
    document.getElementById('popup').style.display = 'flex';
    document.getElementById('showPopupButton').style.display = 'none';
    document.addEventListener('click', closePopupOnClickOutside);
}

function checkSentence() {
    const inputField = document.getElementById('endSentenceInput');
    const input = inputField.value;
    const correctSentence = /^Die Wahrheit liegt im Licht\.?$/i; // Ersetze dies durch den korrekten Satz

    if (correctSentence.test(input)) {
        closePopup();
        const model = document.querySelector('a-entity#final');

        const audio = new Audio('audios/final_message.wav');
        addTextTrack(audio, 'final_message')
            .then(track => {
                model.setAttribute('visible', true);

                audio.play();
                audio.onended = () => {
                    model.setAttribute('visible', false);
                    track.mode = "hidden";
                }
            });
    } else {
        setTimeout(() => alert(`Der Satz "${input}" ist falsch. Bitte versuchen Sie es erneut.`), 500);
    }
    inputField.value = "";
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('showPopupButton').style.display = 'block';
    document.removeEventListener('click', closePopupOnClickOutside);
}

AFRAME.registerComponent('markerhandler', {
    init: async () => {
        const audios = {};
        let markers = document.querySelectorAll("a-marker");
        for (const marker of markers) {
            const id = marker.getAttribute('id');
            audios[id] = new Audio(`audios/${id}_message.wav`);
            const track = await addTextTrack(audios[id], id + "_message");
            marker.addEventListener('markerFound', () => {
                audios[id].play();
            });
            marker.addEventListener('markerLost', () => {
                audios[id].pause();
            });
        }
    }
})

async function addTextTrack(audio, cueFileName) {
    const track = audio.addTextTrack('subtitles', 'German', 'de');
    track.mode = "showing";
    const trackDisplay = document.querySelector('div#trackDisplay');
    return fetch(`audios/${cueFileName}.vtt`)
        .then(response => response.text())
        .then(text => text.split("\r\n\r\n"))
        .then(cues => {
            if (cues.length <= 1 || cues[0].split(" ")[0] !== "WEBVTT") {
                throw `${cueFileName} not a WebVTT file`
            } else {
                return cues.slice(1)
            }
        })
        .then(cues => {
            cues.forEach(cue => {
                const [time, text] = cue.split("\r\n");
                const [start, end] = time.split(" --> ")
                    .map(time => timeToSeconds(time));
                const vttCue = new VTTCue(parseFloat(start), parseFloat(end), text);
                track.addCue(vttCue);
            });
            audio.addEventListener("ended", () => {
                trackDisplay.style.display = 'none';
                trackDisplay.textContent = "";
            });
            audio.addEventListener("pause", () => {
                trackDisplay.style.display = 'none';
            });
            audio.addEventListener("play", () => {
                trackDisplay.style.display = 'block';
            });
            track.addEventListener("cuechange", () => {
                if (track.activeCues.length > 0) {
                    trackDisplay.textContent = track.activeCues[0].text;
                } else {
                    trackDisplay.textContent = "";
                }
            });
            return track;
        })
        .catch(error => console.error(error));
}

function timeToSeconds(time) {
    const timeRegex = /^([0-9]{2}:)?([0-9]{2}):([0-9]{2})(\.[0-9]{1,3})?$/i;
    let result = timeRegex.exec(time);
    if (result === null || result.length === 1) {
        throw `Invalid time format: ${time}`;
    }
    result = result.slice(1).map(value => value === undefined ? 0.0 : parseFloat(value.replace(/[ :.]/i, "")));
    let hours = result[0];
    let minutes = result[1];
    let seconds = result[2];
    let milliseconds = result[3];
    return hours * 3600.0 + minutes * 60.0 + seconds + milliseconds / 1000;
}