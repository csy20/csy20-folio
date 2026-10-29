# csy20 folio

Portfolio for Chitresh Yadav. The Vercel project is `csy20-folio`. `csy20.me` and `www.csy20.me` are attached there, and `www` redirects to the apex.

Namecheap still hosts DNS. The public site follows this project after the GitHub Pages records are replaced with `A @ 216.198.79.1`, `A @ 64.29.17.1`, and `CNAME www a19e90919e47b991.vercel-dns-017.com`. Leave the Namecheap nameservers, MX, and SPF records in place.

The social dock is copied from the live site: same icons, links, tooltips, magnification, tick sound, and mute control. The rest of the page is a type-led layout with a light and a dark theme.

## Run locally

```bash
cd /home/csy20/Documents/dev/csy20-folio
npm install
npm run dev
```

Open the URL Next prints, usually `http://127.0.0.1:3000`. To pin the host:

```bash
npx next dev --hostname 127.0.0.1 --port 3000
```

## Check

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

`npm test` covers the dock interactions, the open-source snapshot, the opening animation, the pipeline diagram, the IST clock, the section nav, the count-up sizer, and the Speech Relay figures. Nothing in the app calls GitHub, Vercel, or another service at runtime. Fonts are self-hosted after the Next.js build downloads Geist.

## Page notes

- **Opening:** about 1.85 s. A pipeline (`mic → vad → asr → out`) lights up under the name, then the panel lifts away. Esc, Enter, or a click skips it. It is skipped entirely under `prefers-reduced-motion`.
- **Header:** sticky. The section nav (Work, Open source, Contact) underlines the section in view. It is hidden on narrow screens. The IST clock shows seconds and a sweeping second hand.
- **Selected work:** a two-column grid. Speech Relay and Nen span both columns. Cards have a cursor-following spotlight.
- **Open source:** each merged pull request expands to show when it was opened, when it merged, and how long that took.
- **Speech Relay figures:** one object, `speechRelayMetrics` in `src/data/siteContent.ts`, feeds the card copy, the hero stat, and the pipeline diagram. The CPU profile (2505 ms mean) and the VAD comparison (23.6%) are separate measurements and stay separate.
- **Theme:** `--accent` and `--pr` live in `src/app/globals.css` for both themes. The theme is stored in `localStorage` as `csy20-theme`.
- **SEO:** `metadataBase`, Open Graph, Twitter card, canonical URL, `robots.txt`, and `sitemap.xml`. The site URL is `siteUrl` in `src/config.ts`. The share image is `/portrait-twitter.jpg`.

## Dock notes

- Home scrolls to `#hero`.
- GitHub, X, Threads, YouTube, and email are in the dock. Instagram and LinkedIn stay in the contact list.
- Mute state is stored in `localStorage` as `csy20-dock-sound`.
- The dock theme toggle switches both the dock chrome and the page between light (`#f6f5f1`) and dark (`rgb(10, 10, 10)`).
