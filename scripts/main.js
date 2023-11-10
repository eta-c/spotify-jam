/*
    Desc: Internal handler (Manages jam sessions)
    Author: Tykind
*/


function getSession() {
    return JSON.parse(document.querySelector("#session").textContent)
}

async function endJamSession(sessionId) {
    const session = getSession()
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
    let response = await fetch(`https://spclient.wg.spotify.com/social-connect/v3/sessions/${sessionId}?alt=json`, options)

    if (!response.ok) {
        console.error('Something went wrong... did you even start one?');
        return
    }
}

async function initJamSession() {
    const session = getSession()
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

        document.joinJam = async (jamId) => {
            // TODO
        }
    } catch (err) {
        console.log(err)
    }
})()
