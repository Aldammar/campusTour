window.onload = () => {
    const url_arr = document.location.href.split("/");
    if (url_arr[url_arr.length - 1] !== "campusTour") {
        url_arr.pop();
    }
    document.location.url = url_arr.join("/") + "/";

    const inputField = document.getElementById('endSentenceInput');
    inputField.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            checkSentence();
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
        const text = "Ihr habt die Herausforderungen bestanden und euch als würdige Nachfolger erwiesen! Stuttgart steht nicht nur für Innovation und Exzellenz, sondern auch für Gemeinschaft. Hiermit seid ihr Teil des „Bundes der Wissenschaft.“ Wisst um euere besondere Gaben und Können, bleibt gemeinsam stark und verändert die Welt!";
        model.setAttribute('visible', true);
        model.setAttribute("text", `value: ${text}; align: center; width: 1.5; wrapCount: 20; x-offset: 1.5; color: orange;`);

        const audio = new Audio('audios/final_message.wav');

        audio.play();
        audio.onended = () => {
            model.setAttribute('visible', false);
        }
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
    init: () => {
        const audios = {};
        const xmlRequest = new XMLHttpRequest();
        xmlRequest.open("GET", "messages.xml", false);
        xmlRequest.send();
        const xml = xmlRequest.responseXML;

        let markers = document.querySelectorAll("a-marker");
        markers.forEach(marker => {
            const id = marker.getAttribute('id');
            audios[id] = new Audio(`audios/${id}_message.wav`);
            marker.addEventListener('markerFound', () => {
                audios[id].play();
            });
            marker.addEventListener('markerLost', () => {
                audios[id].pause();
            });
            const markerEntity = marker.querySelector('a-entity');
            const message = Array.from(xml.querySelectorAll(`message`))
                .find(message => message.querySelector("marker-id").childNodes[0].nodeValue === id);
            const content = message.querySelector("content").childNodes[0].nodeValue;
            markerEntity.setAttribute('text', `value: ${content};align: center; width: 1.5;wrapCount: 20; x-offset: 1.5; color: red;`);
        });
    }
})