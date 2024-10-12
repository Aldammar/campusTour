window.onload = () => {
    const url_arr = document.location.href.split("/");
    if (url_arr[url_arr.length - 1] !== "campusTour") {
        url_arr.pop();
    }
    document.location.url = url_arr.join("/") + "/";

};

function showPopup() {
    document.getElementById('popup').style.display = 'block';
}

function checkSentence() {
    const inputField = document.getElementById('endSentenceInput');
    const input = inputField.value;
    const correctSentence = "Der korrekte Satz"; // Ersetze dies durch den korrekten Satz

    if (input === correctSentence) {
        document.getElementById('popup').style.display = 'none';
        /*const marker = document.querySelector('#last');
        marker.setAttribute('visible', 'true');*/

        const speech = new SpeechSynthesisUtterance("Der Satz ist korrekt.");
        speech.voice = window.speechSynthesis.getVoices().find(voice => voice.lang === 'de-DE') || window.speechSynthesis.getVoices()[0];
        window.speechSynthesis.speak(speech);
    } else {
        alert(`Der Satz "${input}" ist falsch. Bitte versuchen Sie es erneut.`);
    }
    inputField.value = "";
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
