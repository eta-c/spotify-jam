# SPOTIFY-JAM
This extension enables collaborative Spotify listening on a desktop.
![meow](https://github.com/eta-c/spotify-jam/blob/main/images/meow.png)

## Features
SPOTIFY-JAM introduces a range of functionalities accessible through the context menu on your Spotify profile. These include:

- **Start Jam**: Initiate a new Jam session. If a session is already active, this option remains inactive.
- **End Jam**: Terminate an active Jam session. Note: This is only available to the session owner.
- **Share Jam Link**: Generate a shareable link for your current Jam session. Others can use this link to join your session via the official Spotify platform or by inputting the session token directly into the SPOTIFY-JAM extension.
- **Join a Jam**: Enter a session token received from another user to join their Jam session.
- **Leave the Jam**: Exit the current Jam session you're part of.

## How It Works

1. **Accessing New Features**: Upon installing the extension, new buttons will be added to the context menu of your Spotify profile.

   ![Context Menu](https://github.com/eta-c/spotify-jam/blob/main/images/chrome_1i53VveffK.png)

2. **Joining a Session**: You'll need a session token to join a Jam, which can be obtained via the **Share Jam Link** feature. If accessing a Jam session via a direct link, you can paste the link onto a browser and get the other link before it fully redirects. Once you get this other link, you can extract the session token from the URL:

   > open.spotify.com/socialsession/**Token will be here**?si=...

   Enter this token in the Join a Jam dialog to connect to the session.

![Join Session Dialog](https://github.com/eta-c/spotify-jam/blob/main/images/chrome_nAMPp13ot9.png)


*I made this primarily for my girlfriend 🥰 💫*
