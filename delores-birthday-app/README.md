# Delores' 69th Birthday — Mobile Event App

A pink, gold, and white mobile-first event site for **Sunday, November 15, 2026 at 3:30 PM**, at **6 Westwyn Court, Brampton, Ontario L6T 4T5**.

## Features

- Welcome screen featuring Delores' invitation portrait and celebration details.
- Live name lookup across **112 listed guests**.
- Interactive floor plan covering **Tables 1–14**, **Head Table**, buffet, drinks station, kitchen, food table, and photo area.
- Guest roster on every table, with optional "Save this table" on the visitor's device and copyable table details.
- Expandable program timeline with 13 scheduled moments, from 3:30 PM to 8:00 PM.
- Bottom mobile navigation; responsive layout; screen-reader friendly labels.

## Open the app

**Fastest option:** Open `Delores-69th-Birthday-App.html` in a browser. It's a single HTML file, including the portrait and app code. Google Fonts and the optional Tailwind Play CDN enhance the styling when online; custom CSS keeps the app usable without them.

**Publish the website:** Upload only these items to your static host's public/root folder:

- `index.html`
- `styles.css`
- `app.js`
- `assets/delores-portrait.webp`

Use GitHub Pages, Netlify, Cloudflare Pages or any static web host. Share the resulting HTTPS URL with guests. **No server, API key, account, database, or React build process is required.**

## Customize information

To edit names or seating, change `guests.json`. To edit the schedule, change `program.json`. For interactive behavior, adjust `app-main.js`. Then run:

```bash
python build.py
```

The builder produces `app.js` and the updated single-file `Delores-69th-Birthday-App.html`. **Rebuild after changing either JSON file.** The floor plan's table positions are controlled by `TABLE_POSITIONS` near the beginning of `app-main.js` (viewBox coordinates 390 by 650). It was recreated from the supplied hand sketch and is **approximate, not to scale**.

## Privacy and verification

The site includes guests' names. **Anyone with the site URL can search and view the seating lists.** Share the link with invited guests only, or place the page behind a password on your host if the list should not be public.

Before distributing, please verify every name spelling, table placement, timing, and venue details with the family. In particular, several names were provided with one name only and were kept exactly as listed (e.g., Daniel, Roxanne, Maxine, Winsome). The head-table group is counted in the 112 people.

## Technology

HTML5, vanilla JavaScript, responsive custom CSS, Tailwind CSS utility classes and CDN, SVG floor plan, Google Fonts. No runtime package installation.
