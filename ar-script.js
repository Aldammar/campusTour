window.onload = () => {
    const url_arr = document.location.href.split("/");
    if (url_arr[url_arr.length - 1] !== "campusTour") {
        url_arr.pop();
    }
    document.location.url = url_arr.join("/") + "/";

    function pxToVh(px) {
        return px / document.documentElement.clientHeight * 100;
    }

    function pxToVw(px) {
        return px / document.documentElement.clientWidth * 100;
    }

    const images = Array.from(document.querySelectorAll('#decoration img'));
    const button = document.querySelector('#showPopupButton');
    const placedImages = [
        {
            top: pxToVh(document.documentElement.clientHeight - button.style.bottom),
            left: pxToVw(document.documentElement.clientWidth - button.style.right),
            width: pxToVw(button.width),
            height: pxToVh(button.height)
        }
    ];

    function isColliding(image) {
        return placedImages.some(img => Math.abs(img.top - image.top) < img.height + image.height
            && Math.abs(img.left - image.left) < img.width + image.width
        )
    }

    images.forEach(image => {
        let edge, position, newImage;
        do {
            edge = Math.floor(Math.random() * 4);
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
        } while (isColliding(newImage));

        placedImages.push(newImage);

        image.style.top = newImage.top + "vh";
        image.style.left = newImage.left + "vw";

        console.debug(`Image ${image.src.split("/").pop()} positioned at top: ${image.style.top}, left: ${image.style.left}`);
    });
};

function showPopup() {
    document.getElementById('popup').style.display = 'flex';
}

function checkSentence() {
    const inputField = document.getElementById('endSentenceInput');
    const input = inputField.value;
    const correctSentence = /^Die Wahrheit liegt im Licht\.?$/i; // Ersetze dies durch den korrekten Satz

    if (correctSentence.test(input)) {
        document.getElementById('popup').style.display = 'none';

        const audio = new Audio("audios/final_message.wav");
        audio.addEventListener("canplaythrough", () => audio.play());
    } else {
        alert(`Der Satz "${input}" ist falsch. Bitte versuchen Sie es erneut.`);
    }
    inputField.value = "";
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const marker = document.querySelector('#last');
    marker.setAttribute('visible', 'false');
});

AFRAME.registerComponent('markerhandler', {
    init: function () {

        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                loadMarker(xmlHttp.responseXML);
            }
        }
        xmlHttp.open("GET", document.location.url + "messages.xml", true); // true for asynchronous
        xmlHttp.send();

        function loadMarker(xmlDoc) {
            const messages = xmlDoc.getElementsByTagName("message");

            Array.from(messages).forEach(message => {
                const markerId = message.getElementsByTagName("marker-id")[0].textContent.trim();
                const content = message.getElementsByTagName("content")[0].textContent;

                const marker = document.querySelector(`#${markerId}`);

                if (!marker) {
                    console.error(`Marker ${markerId} not found`);
                    return;
                }

                marker.addEventListener('markerFound', () => {
                    console.debug(`Marker ${markerId} found`);
                    if (!window.speechSynthesis.pending) {
                        // Speak the message
                        const speech = new SpeechSynthesisUtterance(content);
                        speech.voice = window.speechSynthesis.getVoices().find(voice => voice.lang === 'de-DE') || window.speechSynthesis.getVoices()[0];
                        window.speechSynthesis.speak(speech);
                    }
                    if (window.speechSynthesis.paused) {
                        window.speechSynthesis.resume();
                    }
                });

                marker.addEventListener('markerLost', () => {
                    console.debug(`Marker ${markerId} lost`);
                    // Stop speaking
                    window.speechSynthesis.pause();
                });
            });
        }
    }
});
