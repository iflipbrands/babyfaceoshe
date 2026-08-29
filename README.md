# BabyFace Oshe — One Page Artist Website

Responsive one-page website built for GitHub Pages.

## Site sections
- Hero / Home
- Tour Dates
- Music — five release cards; clicking a playable card starts the docked player
- Music Videos — two embedded YouTube video slots
- About
- Bookings — sends inquiries to `iflipbrands@gmail.com` and includes a honeypot anti-spam field
- Merch — the only navigation link that leaves the website

## Music player
The player stays visible across the bottom of the site and now has a subtle green glow behind it so it stands apart from the page. It includes cover art, play/pause, progress, time, and a minimize button. When minimized, it becomes a compact player on the lower-right side.

## Admin
Open `admin.html` and enter password: `abc123`.

The admin now uses normal fields instead of raw JSON. You can update:
- Five music slots: title, type, year, audio path/URL, cover image path/URL
- Tour dates: date, city, venue, ticket price, button label, button link
- Two music videos: title, label, YouTube link/embed
- About heading, bio, and quote

### Audio files
Put songs in `assets/audio/`, for example:
`assets/audio/my-time.mp3`

### Cover art / flyers
Put images in `assets/images/`, for example:
`assets/images/my-time-cover.jpg`

Then enter those relative paths in the admin. The player now also recognizes a normal GitHub `.../blob/...` file URL and converts it to the raw audio file automatically. For the most reliable setup, use the relative path like `assets/audio/my-time.mp3`.

### Tour buttons
A tour button appears only when BOTH `Button Label` and `Button Link` are filled in. This lets you use labels like `BUY TICKETS`, `MORE DETAILS`, or anything else. Leave both blank for no button.

### Publishing changes
1. Open `admin.html`.
2. Make your edits.
3. Click **SAVE PREVIEW** and view the site in the same browser.
4. Click **DOWNLOAD content.js**.
5. Replace `assets/js/content.js` in the GitHub repo with the downloaded file.
6. Commit the change.

GitHub Pages is static hosting, so this lightweight admin does not write directly to GitHub. The password is a convenience gate, not server-side security.

## Bookings form
The Bookings form uses FormSubmit's AJAX endpoint so the visitor stays on the site after submitting. FormSubmit may require a one-time email activation for the destination email address before submissions are delivered.


## Artwork and YouTube thumbnails
- Music cover art is controlled in Admin with **Square Cover Art Path / URL**. Upload cover images into `assets/images/` and use a path such as `assets/images/my-song-cover.jpg`. The site displays music artwork as a square 1:1 cover.
- For Music Videos, paste a YouTube embed URL or the full iframe embed code from YouTube Share → Embed. The two players are shown directly on the page with no custom thumbnail overlay.


## Current layout update
- Music: 4 true-square release cards on desktop; 2 across on most phones and 1 across on very narrow phones.
- Music player: always docked at the bottom with a very subtle gray top line and occasional glass-shine sweep; no waveform.
- Videos: 2 direct embedded players. In Admin, paste an embed URL or the full iframe embed code from YouTube.
