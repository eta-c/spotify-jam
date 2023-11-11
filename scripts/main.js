/*
    Desc: Internal handler (Manages jam sessions)
    Author: Tykind
*/

const localeMessages = {
    en: {
        "errorGettingJamSession": "Error getting Jam Session:",
        "failedToInitializeJamSession": "Failed to initialize a new Jam Session.",
        "failedToEndJamSession": "Failed to end the Jam Session.",
        "failedToGenerateShareableUrl": "Failed to generate the shareable URL.",
        "failedToLeaveJamSession": "Failed to leave the Jam Session.",
        "failedToJoinJamSession": "Failed to join the Jam Session.",
        "copiedToClipboard": "Copied to clipboard",
        "startAJam": "Start a Jam",
        "endJam": "End Jam",
        "shareJamLink": "Share Jam Link",
        "leaveTheJam": "Leave the Jam",
        "joinAJam": "Join a Jam",
        "enterSessionToken": "Enter sessionToken",
        "requestFailed": "Request failed",
        "failedToParseJSON": "Failed to parse response as JSON:",
        "sessionToken": "sessionToken",
        "requestFailed": "Request failed:",
        "spotifyJamming": "Spotify Jamming!",
        "desktopJamUsage": "Allows for desktop to use Spotify Jam (Made for my gf)",
        "jamSessionNonExistentOrInactive": "The Jam session is either non-existent or not active.",
        "startAJam": "Start a Jam",
        "endJam": "End Jam",
        "shareJamLink": "Share Jam Link",
        "leaveTheJam": "Leave the Jam",
        "joinAJam": "Join a Jam",
        "errorAddingButtons": "Error adding buttons to context menu:",
        "createJamSession": 'Jam session created',
        "endedJamSession": 'Ended the Jam session',
        "LeftJam": 'Left the Jam',
        "JoinedJam": 'Joined the Jam'
    },
    es: {
        "errorGettingJamSession": "Error al obtener la sesión de Jam:",
        "failedToInitializeJamSession": "Error al iniciar una nueva sesión de Jam.",
        "failedToEndJamSession": "Error al terminar la sesión de Jam.",
        "failedToGenerateShareableUrl": "Error al generar el URL compartible.",
        "failedToLeaveJamSession": "Error al salir de la sesión de Jam.",
        "failedToJoinJamSession": "Error al unirse a la sesión de Jam.",
        "copiedToClipboard": "Copiado al portapapeles",
        "startAJam": "Iniciar una Jam",
        "endJam": "Terminar Jam",
        "shareJamLink": "Compartir enlace de Jam",
        "leaveTheJam": "Salir de la Jam",
        "joinAJam": "Unirse a una Jam",
        "enterSessionToken": "Introduce el token de sesión",
        "requestFailed": "Solicitud fallida",
        "failedToParseJSON": "Error al interpretar la respuesta como JSON:",
        "sessionToken": "token de sesión",
        "requestFailed": "Solicitud fallida:",
        "spotifyJamming": "¡Jamming en Spotify!",
        "desktopJamUsage": "Permite el uso de Spotify Jam en escritorio (Creado para mi novia)",
        "jamSessionNonExistentOrInactive": "La sesión de Jam no existe o no está activa.",
        "startAJam": "Iniciar una Jam",
        "endJam": "Terminar Jam",
        "shareJamLink": "Compartir enlace de Jam",
        "leaveTheJam": "Salir de la Jam",
        "joinAJam": "Unirse a una Jam",
        "errorAddingButtons": "Error al añadir botones al menú contextual:",
        "createJamSession": "Sesión de Jam creada",
        "endedJamSession": "Sesión de Jam terminada",
        "LeftJam": "Se salió del Jam",
        "JoinedJam": "Se unió al Jam"
    }
};

function getSession() {
    return JSON.parse(document.querySelector("#session").textContent);
}

function getConfig() {
    return JSON.parse(document.querySelector("#config").textContent);
}

function getLocalizedMessage(key) {
    const config = getConfig();
    let language = config.locale.locale || "en";

    // Spanish hack 2023 !!! 😱

    if (language.includes('es-')) {
        language = 'es'
    }

    return localeMessages[language][key] || localeMessages["en"][key];
}

async function spotifyFetch(config) {
    const { endpoint, method, headersExtra, body, jsonExpected } = config;
    const session = getSession();
    const headers = {
        'App-Platform': 'iOS',
        'User-Agent': 'Spotify/8.8.82 iOS/17.2 (iPhone13,4)',
        'X-Client-Id': session.clientId,
        Cookie: document.cookie,
        Authorization: `Bearer ${session.accessToken}`,
        ...headersExtra
    };

    const response = await fetch(endpoint, { method, headers, body: body ? JSON.stringify(body) : undefined });

    if (response.status !== 200 && response.status !== 201) {
        console.error(`${getLocalizedMessage(requestFailed)} ${response.status} - ${response.statusText}`);
        return;
    }

    if (jsonExpected) {
        try {
            return await response.json();
        } catch (error) {
            console.error(getLocalizedMessage('failedToParseJSON'), error);
            return;
        }
    } else {
        return response.text();
    }
}

async function getJamSessionFromId(jamSessionId) {
    return spotifyFetch({
        endpoint: `https://spclient.wg.spotify.com/social-connect/v2/sessions/info/${jamSessionId}?alt=json`,
        method: 'GET',
        headersExtra: {},
        jsonExpected: true
    });
}

async function endJamSession(jamSessionId) {
    return spotifyFetch({
        endpoint: `https://spclient.wg.spotify.com/social-connect/v3/sessions/${jamSessionId}`,
        method: 'DELETE',
        headersExtra: {},
        jsonExpected: false
    });
}

async function initJamSession() {
    return spotifyFetch({
        endpoint: 'https://spclient.wg.spotify.com/social-connect/v2/sessions/current_or_new?activate=true&alt=json',
        method: 'GET',
        headersExtra: {},
        jsonExpected: true
    });
}

async function getJamSession() {
    return spotifyFetch({
        endpoint: 'https://spclient.wg.spotify.com/social-connect/v2/sessions/current?alt=json',
        method: 'GET',
        headersExtra: {},
        jsonExpected: true
    });
}

async function dropUrl() {
    const jamSession = await getJamSession();
    if (!jamSession) return;

    const body = {
        custom_data: [
            { key: "jam", value: "1" },
            { key: "ipl", value: "1" },
            { key: "app_destination", value: "socialsession" },
            { key: "ssp", value: "1" }
        ],
        link_preview: {
            title: getLocalizedMessage('spotifyJamming'),
            image_url: "https://shareables.scdn.co/publish/socialsession/3MRiUV7FXcxp2CotBWiiQfSwoomTU2ojnMESH7INqovWZE53KjGpD0Wb1Tl8Gov4HOszHnXilwu8WdVvMCrFysbaLXHm9cMryBFt3iv1lJIM",
            description: getLocalizedMessage('desktopJamUsage')
        },
        utm_parameters: {
            utm_medium: "share-link",
            utm_source: "share-options-sheet"
        },
        spotify_uri: jamSession.join_session_uri
    };

    return spotifyFetch({
        endpoint: 'https://spclient.wg.spotify.com/url-dispenser/v1/generate-url',
        method: 'POST',
        headersExtra: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: body,
        jsonExpected: true
    });
}

async function joinJamSession(sessionId) {
    const jamSession = await getJamSessionFromId(sessionId);
    if (!jamSession || !jamSession.active) {
        console.log(getLocalizedMessage('jamSessionNonExistentOrInactive'));
        return;
    }

    return spotifyFetch({
        endpoint: `https://spclient.wg.spotify.com/social-connect/v2/sessions/join/${sessionId}?alt=json&join_type=deeplinking&playback_control=listen_and_control`,
        method: 'POST',
        headersExtra: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        jsonExpected: true
    });
}

async function leaveJamSession(sessionId) {
    const jamSession = await getJamSession();
    if (!jamSession || !jamSession.active) {
        console.log(getLocalizedMessage('jamSessionNonExistentOrInactive'));
        return;
    }

    return spotifyFetch({
        endpoint: `https://spclient.wg.spotify.com/social-connect/v3/sessions/${sessionId}/leave?alt=json`,
        method: 'POST',
        headersExtra: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        jsonExpected: false
    });
}

(async () => {
    let jamSession;

    try {
        jamSession = await getJamSession();
        console.log(jamSession)
    } catch (err) {
        console.error(getLocalizedMessage('errorGettingJamSession'), err);
    }

    // Define functions to manage Jam Sessions
    document.initJam = async () => {
        const newJamSession = await initJamSession();
        if (newJamSession) {
            jamSession = newJamSession;
            alert(getLocalizedMessage('createJamSession'));
        } else {
            console.error(getLocalizedMessage('failedToInitializeJamSession'));
        }
    };

    document.endJam = async () => {
        if (jamSession?.is_session_owner) {
            const result = await endJamSession(jamSession.session_id);
            if (result !== null) {
                jamSession = null;
                alert(getLocalizedMessage('endedJamSession'));
            } else {
                console.error(getLocalizedMessage('failedToEndJamSession'));
            }
        }
    };

    document.shareLink = async () => {
        if (!jamSession?.session_id) return;
        const urlInfo = await dropUrl();
        if (urlInfo) {
            navigator.clipboard.writeText(`${getLocalizedMessage('sessionToken')}: ${jamSession.join_session_token} || URL: ${urlInfo.shareable_url}`);
            alert(getLocalizedMessage('copiedToClipboard'));
        } else {
            console.error(getLocalizedMessage('failedToGenerateShareableUrl'));
        }
    };

    document.leaveJam = async () => {
        if (!jamSession?.session_id) return;
        const result = await leaveJamSession(jamSession.session_id);
        if (result === null) {
            console.error(getLocalizedMessage('failedToLeaveJamSession'));
        } else {
            alert(getLocalizedMessage('LeftJam'));
        }
    };

    document.joinJam = async () => {
        const jamSessionId = window.prompt(getLocalizedMessage('enterSessionToken'));
        if (jamSessionId) {
            const joinedSession = await joinJamSession(jamSessionId);
            if (joinedSession) {
                jamSession = joinedSession;
                alert(getLocalizedMessage('JoinedJam'));
            } else {
                console.error(getLocalizedMessage('failedToJoinJamSession'));
            }
        }
    };

    // UI Handler and Event Listener Setup
    const buttons = [
        { Name: getLocalizedMessage('startAJam'), event: document.initJam },
        { Name: getLocalizedMessage('endJam'), event: document.endJam },
        { Name: getLocalizedMessage('shareJamLink'), event: document.shareLink },
        { Name: getLocalizedMessage('joinAJam'), event: document.joinJam },
        { Name: getLocalizedMessage('leaveTheJam'), event: document.leaveJam },
    ];

    const targetNode = document.querySelector('body');
    const observer = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                try {
                    let contextMenu = document.querySelector("#context-menu > div > ul");
                    let profileButton = document.querySelector("#main > div > div.ZQftYELq0aOsg6tPbVbV > div.jEMA2gVoLgPQqAFrPhFw > header > button.Button-sc-1dqy6lx-0.grWQsc.encore-over-media-set.SFgYidQmrqrFEVh65Zrg")

                    if (!contextMenu)
                        return

                    let logoutButton = contextMenu.querySelector(`li:nth-child(6)`)
                    let settingsButton = contextMenu.querySelector(`li:nth-child(5)`)
                    buttons.forEach((button, index) => {
                        if (button.element && contextMenu.contains(button.element)) return;

                        const templateButton = index === buttons.length - 1 ? settingsButton : logoutButton;
                        const elm = templateButton.cloneNode(true);
                        const span = elm.querySelector('span[data-encore-id="type"]');
                        span.textContent = button.Name;

                        if (index === buttons.length - 1) {
                            const anchorElm = elm.querySelector(`a:nth-child(1)`);
                            anchorElm.removeAttribute('href');
                        }

                        button.element = elm;
                        contextMenu.insertBefore(elm, logoutButton);
                        elm.addEventListener('click', () => {
                            profileButton.click();
                            button.event();
                        });
                    });
                } catch (err) {
                    console.error(getLocalizedMessage('errorAddingButtons'), err);
                }
            }
        }
    });

    observer.observe(targetNode, { childList: true, subtree: true });
})();
