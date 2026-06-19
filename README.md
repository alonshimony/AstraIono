# Astra Iono — Feel the Frequency

A premium, cinematic landing page for **Astra Iono**, a multi-genre music project
by **Alon Shimony**. Built as a fast, dependency-free static site (HTML + CSS +
vanilla JS) — no build step, deploys anywhere.

> _"Music is alignment. Vibration is power. You are the signal."_

## Run locally

It's a static site — just open `index.html`, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
index.html        # all sections / page content
css/styles.css    # cinematic dark theme, animations, responsive layout
js/main.js        # particles, scroll reveals, parallax, embeds, nav, signup
assets/
  logo.svg        # main neon "ASTRA IONO / FEEL THE FREQUENCY" wordmark (transparent)
  logo-mark.svg   # compact horizontal logo for nav + footer
  favicon.svg
```

The logos are recreated as scalable SVG from the brand reference (cyan neon
double-outline wordmark, pink energy slash, "Feel the Frequency" plate).

## Plugging in real content

Everything is wired with clearly-marked placeholders. To go live:

### Spotify song previews — `index.html`
Each `.song-card` has a `data-spotify=""` attribute. Drop in a Spotify **track ID**
(the part after `open.spotify.com/track/`) and the embedded player builds itself:

```html
<article class="song-card" data-spotify="4cOdK2wGLETKBW3PvgPWqT">
```

### YouTube videos — `index.html`
The featured video (`.feature-video`) and each `.video-tile` have a `data-yt=""`
attribute. Add a YouTube **video ID**:

```html
<figure class="feature-video" data-yt="dQw4w9WgXcQ">
```

The featured video lazy-loads on click (privacy-friendly `youtube-nocookie`).

### Links
Buttons use `data-link="spotify|youtube|instagram|apple|tiktok"`. Replace the
placeholder `href` values (currently `https://open.spotify.com`, `https://youtube.com`,
etc.) with the real Astra Iono profile URLs.

### Gallery visuals — `css/styles.css`
The Visual Universe tiles (`.g1`–`.g6`) currently use generated gradient art.
Swap each `background` for `url('assets/your-image.jpg')` (with
`background-size: cover; background-position: center;`) to use real cinematic frames.

### Newsletter
`#signupForm` in `js/main.js` validates the email client-side and shows a success
message. Wire the marked `TODO` to a real provider (Mailchimp / ConvertKit / your
endpoint) when ready.

## Sections
1. **Hero** — neon logo, tagline, primary CTAs, particle field
2. **Feel the Frequency** — song preview cards (Spotify embeds)
3. **Watch the Vision** — featured video + grid (YouTube)
4. **The Story** — bio, meaning of the name, mission, *The Balance*
5. **The Visual Universe** — parallax gallery
6. **Featured Releases** — release cards
7. **The Belief** — the Astra Iono mantra
8. **Enter the Frequency** — final CTA + newsletter
9. **Footer** — social links

## Notes
- Respects `prefers-reduced-motion` (disables particles, parallax, intro).
- Fully responsive with a mobile nav.
- No external JS dependencies; only Google Fonts is fetched.
