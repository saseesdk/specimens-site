# Specimens website

Static site for GitHub Pages: no build step. Upload the contents of this folder to the repository root (or a `/docs` folder) and turn on Pages.

## Files
- `index.html`: the landing page
- `privacy/index.html`, `delete-account/index.html`: the privacy policy and account-deletion pages. Their addresses (`/privacy/`, `/delete-account/`) are linked from Google Play: don't move them
- `404.html`: shown by GitHub Pages for any missing URL
- `CNAME`, `app-ads.txt`, `.nojekyll`: custom domain, AdMob verification, no Jekyll processing: keep them
- `assets/css/site.css`, `assets/js/site.js`: styles and behaviour
- `assets/js/config.js`: **launch switch and store link**
- `assets/img/`, `assets/fonts/`: art and self-hosted fonts (EB Garamond, IM Fell English; SIL Open Font License, licence files included)

## Before launch: "Coming soon"
In `assets/js/config.js` set `launch: "soon"`. Every Google Play button on every page becomes a non-clickable "Coming soon to Google Play" plate. Set it to `"live"` on launch day (it is `"soon"` now: the app is still in closed testing). Also change `data-launch="soon"` to `"live"` at the top of each HTML page.

## 404 page on a project site
`404.html` loads assets from the site root (`<base href="/">`). If the site is served from `username.github.io/REPO/` instead of a custom domain, change that line to `<base href="/REPO/">`.

## Google Play badge
The buttons are styled in the cabinet's brass. If you prefer Google's official badge artwork, get it from Google's badge generator and replace the `.play-live` link contents.
