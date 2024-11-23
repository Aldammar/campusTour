/**
 * Function to handle window load event.
 * Initializes a clean URL, input field listener, and decoration image placement.
 */
window.onload = () => {
    getCleanUrl();

    setupInputFieldListener();

    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
        const audio_load_popup = document.createElement("div");
        audio_load_popup.className = "popup";
        audio_load_popup.id = "audioLoadPopup";
        const heading = document.createElement("h1");
        heading.textContent = "Audios laden";
        const paragraph = document.createElement("p");
        paragraph.textContent = "Bitte bestätige, dass du alle Audios laden willst. Ansonsten wird die Seite nicht korrekt funktionieren.";
        const button = document.createElement("button");
        button.textContent = "Audios laden";
        button.onclick = () => {
            document.getElementById("audioLoadPopup").style.display = "none";
            loadMedia();
        };
        button.className = "confirmButton";
        audio_load_popup.appendChild(heading);
        audio_load_popup.appendChild(paragraph);
        audio_load_popup.appendChild(button);
        document.body.appendChild(audio_load_popup);
        audio_load_popup.style.display = "flex";
    } else {
        setupAudioTracks();
    }

    placeDecorationImages();
};

/**
 * A-Frame component to handle audio playback for markers.
 */
AFRAME.registerComponent('audiomarker', {
    /**
     * Initializes the component.
     * Sets up event listeners for marker found and lost events.
     */
    init: function () {
        const marker = this.el;
        const audio = marker.querySelector("audio");

        marker.addEventListener('markerFound', () => {
            console.info(`Marker ${marker.id} found`);
            audio.play();
            console.info(`Playing ${audio.currentSrc}`);
        });
        marker.addEventListener('markerLost', () => {
            console.info(`Marker ${marker.id} lost`);
            audio.pause();
            console.info(`Paused ${audio.currentSrc}`);
        });
    }
})

function loadMedia() {
    for (const audio in document.querySelectorAll("audio")) {
        audio.muted = true;
        audio.play();
        audio.muted = false;
    }
    setupAudioTracks();
}

/**
 * Function to clean and redirect the URL.
 */
function getCleanUrl() {
    const url_arr = document.location.href.split("/");
    if (url_arr[url_arr.length - 1] !== "campusTour") {
        url_arr.pop();
    }
    document.location.url = url_arr.join("/") + "/";
}

/**
 * Function to set up an event listener for the input field.
 * Listens for the 'Enter' key press to trigger the checkSentence function.
 */
function setupInputFieldListener() {
    const inputField = document.getElementById('endSentenceInput');
    inputField.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            await checkSentence();
        }
    });
}

/**
 * Function to set up event listeners for audio tracks.
 * Displays track information and handles play, pause, and end events.
 */
function setupAudioTracks() {
    const audios = document.querySelectorAll("audio");
    const trackDisplay = document.getElementById("trackDisplay");
    audios.forEach(audio => {
        const track = audio.querySelector("track");
        audio.addEventListener("ended", () => {
            trackDisplay.style.display = 'none';
            trackDisplay.textContent = "";
            console.info(`Ended ${audio.currentSrc} and cleared track display`);
        });
        audio.addEventListener("pause", () => {
            trackDisplay.style.display = 'none';
            console.info(`Paused ${audio.currentSrc} and hidden track display`);
        });
        audio.addEventListener("play", () => {
            trackDisplay.style.display = 'block';
            console.info(`Playing ${audio.currentSrc} and shown track display`);
        });
        track.addEventListener('cuechange', () => {
            const cues = track.track.activeCues;
            if (cues.length) {
                trackDisplay.textContent = cues[0].text;
            } else {
                trackDisplay.textContent = "";
            }
        });
    });
}

/**
 * Function to place decoration images around the screen.
 */
function placeDecorationImages() {
    const images = Array.from(document.querySelectorAll('#decoration img'));
    const button = document.querySelector('#showPopupButton');
    const placedImages = [{
        top: pxToVh(valueOfUnitString(window.getComputedStyle(button).top)),
        left: pxToVw(valueOfUnitString(window.getComputedStyle(button).left)),
        width: pxToVw(valueOfUnitString(window.getComputedStyle(button).width)),
        height: pxToVh(valueOfUnitString(window.getComputedStyle(button).height))
    }];

    const edgeCount = [
        Math.ceil(images.length / 4),
        Math.floor(images.length / 4),
        Math.floor(images.length / 4),
        Math.round(images.length / 4)
    ]

    images.forEach(image => {
        placeImage(edgeCount, image, placedImages);
    });
}

/**
 * Function to place a single image at a random position along the edges of the screen.
 * @param {Array} edgeCount - Array containing the count of images to be placed on each edge.
 * @param {HTMLElement} image - The image element to be placed.
 * @param {Array} placedImages - Array of already placed images with their positions.
 */
function placeImage(edgeCount, image, placedImages) {
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
    } while (isColliding(placedImages, newImage) && iterations < 100);
    if (iterations === 100) {
        image.style.display = 'none';
        console.info(`Image ${image.src.split("/").pop()} could not be placed`);
    } else {
        edgeCount[edge]--;
        placedImages.push(newImage);

        image.style.top = newImage.top + "vh";
        image.style.left = newImage.left + "vw";
    }
}

/**
 * Converts pixels to viewport height (vh).
 * @param {number} px - The pixel value to be converted.
 * @returns {number} - The equivalent value in viewport height (vh).
 */
function pxToVh(px) {
    return px / document.documentElement.clientHeight * 100;
}

/**
 * Converts pixels to viewport width (vw).
 * @param {number} px - The pixel value to be converted.
 * @returns {number} - The equivalent value in viewport width (vw).
 */
function pxToVw(px) {
    return px / document.documentElement.clientWidth * 100;
}

/**
 * Extracts the numeric value from a unit string (e.g., "10px").
 * @param {string} unitString - The unit string to be parsed.
 * @returns {number} - The numeric value extracted from the unit string.
 */
function valueOfUnitString(unitString) {
    const unitStringRegex = /([0-9.]+)([a-z%]+)/i;
    return parseFloat(unitStringRegex.exec(unitString)[1]);
}

/**
 * Checks if a new image position collides with any already placed images.
 * @param {Array} placedImages - Array of already placed images with their positions.
 * @param {Object} image - The new image position to be checked.
 * @returns {boolean} - True if the new image position collides with any placed images, false otherwise.
 */
function isColliding(placedImages, image) {
    return placedImages.some(img => Math.abs(img.top - image.top) < img.height + image.height && Math.abs(img.left - image.left) < img.width + image.width);
}

/**
 * Event handler to close the popup when clicking outside of it.
 * @param {Event} event - The click event.
 */
function closePopupOnClickOutside(event) {
    const popup = document.getElementById('popup');
    const button = document.getElementById('showPopupButton');

    if (!popup.contains(event.target) && !button.contains(event.target)) {
        closePopup();
    }
}

/**
 * Function to show the popup.
 */
function showPopup() {
    document.getElementById('popup').style.display = 'flex';
    document.getElementById('showPopupButton').style.display = 'none';
    document.addEventListener('click', closePopupOnClickOutside);
}

/**
 * Function to check the entered sentence against the correct sentence.
 * If correct, plays the final message audio and shows the final model.
 * If incorrect, shows an alert message.
 */
function checkSentence() {
    const inputField = document.getElementById('endSentenceInput');
    const input = inputField.value;
    const correctSentence = /^Die Wahrheit liegt im Licht\.?$/i; // Ersetze dies durch den korrekten Satz

    if (correctSentence.test(input)) {
        closePopup();

        const model = document.querySelector('a-entity#final');
        const audio = model.querySelector("audio");

        model.setAttribute('visible', true);

        audio.play().then(() => console.info(`Playing ${audio.currentSrc}`)).catch(e => console.error(e));
        audio.onended = () => {
            model.setAttribute('visible', false);
        }
    } else {
        setTimeout(() => alert(`Der Satz "${input}" ist falsch. Bitte versuchen Sie es erneut.`), 500);
    }
    inputField.value = "";
}


/**
 * Function to close the popup.
 */
function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('showPopupButton').style.display = 'block';
    document.removeEventListener('click', closePopupOnClickOutside);
}