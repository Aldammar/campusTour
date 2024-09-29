window.onload = () => {
    const url_arr = document.location.href.split("/");
    if (url_arr[url_arr.length - 1] !== "campusTour") {
        url_arr.pop();
    }
    const url = url_arr.join("/") + "/";
    document.location.url = url;


    document.querySelectorAll('a-marker').forEach(marker => {
        const originalUrl = marker.getAttribute('url');
        marker.setAttribute('url', `${url}${originalUrl}`);
    });
    document.querySelectorAll('a-entity').forEach(marker => {
        if (marker.hasAttribute('gltf-model')) {
            const originalUrl = marker.getAttribute('gltf-model');
            marker.setAttribute('gltf-model', `${url}${originalUrl}`);
        }
    });
};

AFRAME.registerComponent('markerhandler', {
    init: function () {
        console.info('Marker handler component initialized!');

        const voice = window.speechSynthesis.getVoices().find(value => value.lang === "de-DE") || window.speechSynthesis.getVoices()[0];

        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                console.debug('xmlHttp.responseText: ', xmlHttp.responseText);
                loadMarker(xmlHttp.responseXML);
            }
        }
        xmlHttp.open("GET", "/messages.xml", true); // true for asynchronous
        xmlHttp.send();

        function loadMarker(xmlDoc) {
            const messages = xmlDoc.getElementsByTagName("message");

            Array.from(messages).forEach(message => {
                const markerId = message.getElementsByTagName("marker")[0].textContent.trim();
                const content = message.getElementsByTagName("content")[0].textContent;
                const modelUrl = message.getElementsByTagName("model")[0].textContent.trim();

                const marker = document.querySelector(`#${markerId}`);
                console.debug('marker: ', marker);
                const aEntity = marker.querySelector('a-entity');
                console.debug('aEntity: ', aEntity);
                console.debug("doc url: ", document.location.url);

                aEntity.addEventListener('click', (ev) => {
                    console.debug('Marker clicked!');
                    console.debug('intersection: ', ev.detail.intersection.point);

                    // Speak the message
                    const speech = new SpeechSynthesisUtterance(content);
                    speech.voice = voice;
                    window.speechSynthesis.speak(speech);

                    // Update the model URL in the marker
                    aEntity.setAttribute('gltf-model', document.location.url + modelUrl);
                });
            });
        }
    }
});
