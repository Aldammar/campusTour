window.onload = () => {
    const url_arr = document.location.href.split("/");
    if (url_arr[url_arr.length - 1] !== "campusTour") {
        url_arr.pop();
    }
    document.location.url = url_arr.join("/") + "/";

};

AFRAME.registerComponent('markerhandler', {
    init: function () {

        const voice = window.speechSynthesis.getVoices().find(voice => voice.lang === 'de-DE') || window.speechSynthesis.getVoices()[0];

        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                loadMarker(xmlHttp.responseXML);
            }
        }
        xmlHttp.open("GET", "/messages.xml", true); // true for asynchronous
        xmlHttp.send();

        function loadMarker(xmlDoc) {
            const messages = xmlDoc.getElementsByTagName("message");

            Array.from(messages).forEach(message => {
                const markerId = message.getElementsByTagName("marker-id")[0].textContent.trim();
                const content = message.getElementsByTagName("content")[0].textContent;

                const marker = document.querySelector(`#${markerId}`);
                const aText = marker.querySelector("a-text");

                marker.addEventListener('markerFound', () => {
                    if (window.speechSynthesis.paused) {
                        window.speechSynthesis.resume();
                    } else {
                        // Speak the message
                        const speech = new SpeechSynthesisUtterance(content);
                        speech.voice = voice;
                        window.speechSynthesis.speak(speech);
                    }
                });

                marker.addEventListener('markerLost', () => {
                    // Stop speaking
                    window.speechSynthesis.pause();
                });
            });
        }
    }
});
