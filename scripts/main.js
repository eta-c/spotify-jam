/*
    Desc: Internal handler (Manages jam sessions)
    Author: Tykind
*/


function getSession() {
    return JSON.parse(document.querySelector("#session").textContent)
}

async function endJamSession(jamSessionId, cacheSession) {
    const session = cacheSession || getSession()
    const options = {
        method: 'DELETE',
        headers: {
            'App-Platform': 'iOS',
            'User-Agent': 'Spotify/8.8.82 iOS/17.2 (iPhone13,4)',
            'X-Client-Id': session.clientId,
            Cookie: document.cookie,
            Authorization: `Bearer ${session.accessToken}`
        }
    };
    let response = await fetch(`https://spclient.wg.spotify.com/social-connect/v3/sessions/${jamSessionId}`, options)

    if (!response.ok) {
        console.error('Something went wrong... did you even start one?');
        return
    }
}

async function initJamSession(cacheSession) {
    const session = cacheSession || getSession()
    const options = {
        method: 'GET',
        headers: {
            'App-Platform': 'iOS',
            'User-Agent': 'Spotify/8.8.82 iOS/17.2 (iPhone13,4)',
            'X-Client-Id': session.clientId,
            Cookie: document.cookie,
            Authorization: `Bearer ${session.accessToken}`
        }
    };
    let response = await fetch('https://spclient.wg.spotify.com/social-connect/v2/sessions/current_or_new?activate=true&alt=json', options)

    if (!response.ok) {
        console.error('Failed to init jam session');
        return
    }

    return (await response.json())
}

async function getJamSession(cacheSession) {
    const session = cacheSession || getSession()
    const options = {
        method: 'GET',
        headers: {
            'App-Platform': 'iOS',
            'User-Agent': 'Spotify/8.8.82 iOS/17.2 (iPhone13,4)',
            'X-Client-Id': session.clientId,
            Cookie: document.cookie,
            Authorization: `Bearer ${session.accessToken}`
        }
    };
    let response = await fetch('https://spclient.wg.spotify.com/social-connect/v2/sessions/current?alt=json', options)

    if (!response.ok) {
        console.error('No jam session');
        return
    }

    return (await response.json())
}

async function dropUrl(cacheSession) {
    const session = cacheSession || getSession()
    const jamSession = await getJamSession(session)

    const options = {
        method: 'POST',
        headers: {
            'App-Platform': 'iOS',
            'User-Agent': 'Spotify/8.8.82 iOS/17.2 (iPhone13,4)',
            'X-Client-Id': session.clientId,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Cookie: document.cookie,
            Authorization: `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
            "custom_data": [
                { "key": "jam", "value": "1" },
                { "key": "ipl", "value": "1" },
                { "key": "app_destination", "value": "socialsession" },
                { "key": "ssp", "value": "1" }
            ],
            "link_preview": {
                "title": "SPOTIFY JAMMING!!!",
                "image_url": "https://shareables.scdn.co/publish/socialsession/3MRiUV7FXcxp2CotBWiiQfSwoomTU2ojnMESH7INqovWZE53KjGpD0Wb1Tl8Gov4HOszHnXilwu8WdVvMCrFysbaLXHm9cMryBFt3iv1lJIM",
                "description": 'Allows for desktop to use Spotify Jam (Made for my gf)'
            },
            "utm_parameters": {
                "utm_medium": "share-link",
                "utm_source": "share-options-sheet"
            },
            "spotify_uri": jamSession.join_session_uri
        })
    };

    let response = await fetch('https://spclient.wg.spotify.com/url-dispenser/v1/generate-url', options)

    if (response.status != 201) {
        console.error('Failed to generate URL');
        return
    }

    return (await response.json())
}

async function joinJamSession() {
    const session = getSession()
    const jamSession = await getJamSession(session)
    // TODO
}

(async () => {
    try {
        let jamSession
        let allowJamEnd

        document.initJam = async () => {
            jamSession = await initJamSession();
            allowJamEnd = true
        }

        document.endJam = async () => {
            allowJamEnd = false
            if (jamSession) {
                await endJamSession(jamSession.session_id)
                jamSession = undefined
            }
            allowJamEnd = true
        }

        document.shareLink = async () => {
            const urlInfo = await dropUrl();
            alert(urlInfo.shareable_url)
        }

        document.joinJam = async () => {
            joinJamSession()
        }


        // --> UI HANDLER

        let buttons = [{ Name: 'Start a Jam', event: document.initJam, element: null }, { Name: 'End Jam', event: document.endJam, element: null }, { Name: 'Share Jam Link', event: document.shareLink, element: null }, { Name: 'Join a Jam', event: document.joinJam, element: null }];
        let targetNode = document.querySelector('body');
        let config = { childList: true, subtree: true };

        let callback = function (mutationsList, observer) {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    try {
                        let context_menu = document.querySelector("#context-menu > div > ul");
                        let profile_button = document.querySelector("#main > div > div.ZQftYELq0aOsg6tPbVbV > div.jEMA2gVoLgPQqAFrPhFw > header > button.Button-sc-1dqy6lx-0.grWQsc.encore-over-media-set.SFgYidQmrqrFEVh65Zrg")

                        if (!context_menu)
                            continue

                        let logoutButton = context_menu.querySelector(`li:nth-child(6)`)
                        let settingsButton = context_menu.querySelector(`li:nth-child(5)`)

                        for (let i = 0; i < buttons.length; i++) {
                            let button = buttons[i]

                            if (button.element != null && context_menu.contains(button.element))
                                continue

                            let elm = (i == buttons.length - 1 ? settingsButton : logoutButton).cloneNode(true);
                            let span = elm.querySelector('span[data-encore-id="type"]');
                            span.textContent = button.Name;


                            button.element = elm;
                            context_menu.insertBefore(elm, logoutButton);
                            elm.addEventListener('click', () => {
                                profile_button.click();
                                button.event()
                            })
                        }
                    } catch (err) {
                        console.log(err)
                    }
                }
            }
        };

        let observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    } catch (err) {
        console.log(err)
    }
})()
