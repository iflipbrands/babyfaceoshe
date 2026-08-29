# BabyFace Oshe — One Page Artist Website

A responsive, one-page static website built for GitHub Pages.

## Site layout
- Hero / Home
- Tour Dates
- Music — 5 release columns on large screens; responsive on tablets and phones
- Music Videos — 2 columns on large screens
- About
- Merch is the only external link and points to the official Fourthwall shop

## Admin
Open `admin.html` and enter the password: `abc123`.

The admin edits:
- Music
- Tour dates
- Videos
- About

### Music playback
For a release to play directly on the site, add a direct audio-file URL in the `audio` field, such as an `.mp3`, `.m4a`, or `.ogg` URL. A normal Spotify/SoundCloud page URL is not a direct audio file and cannot be played by the built-in HTML audio player.

### Videos
Put a YouTube URL in the `embed` field. The video opens and plays inside the website instead of sending the visitor away.

### Publishing admin changes
1. Open `admin.html`.
2. Edit the JSON.
3. Click **SAVE PREVIEW** to test changes locally in the same browser.
4. Click **DOWNLOAD content.js**.
5. Replace `assets/js/content.js` in the GitHub repo with the downloaded file.
6. Commit the change.

GitHub Pages is static hosting, so this lightweight password admin cannot securely write directly into the GitHub repository without a separate backend or GitHub API authentication.
