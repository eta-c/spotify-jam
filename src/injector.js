/*
    Desc: Injector
    Author: Tykind
*/

function injectScript(config) {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL(config.src);
    s.type = "module"
    s.setAttribute('name', config.name)
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}


injectScript({
    name: 'Spotify Jam',
    src: 'scripts/main.js'
})
