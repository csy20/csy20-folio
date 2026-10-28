# csy20 folio

Portfolio for Chitresh Yadav. The Vercel project is `csy20-folio`. `csy20.me` and `www.csy20.me` are attached there, and `www` redirects to the apex.

Namecheap still hosts DNS. The public site follows this project after the GitHub Pages A records are replaced with `76.76.21.21` on `@` and `www`. Leave the Namecheap MX and SPF records in place.

The social dock is copied from the live site: same icons, links, tooltips, magnification, tick sound, and mute control. The rest of the page is a dark, type-led layout.

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
npm test
npm run build
```

`npm test` covers the copied dock interactions and the open-source snapshot. Nothing in the app calls GitHub, Vercel, or another service at runtime. Fonts are self-hosted after the Next.js build downloads Geist.

## Dock notes

- Home scrolls to `#hero`.
- GitHub, X, Threads, YouTube, and email are in the dock. Instagram and LinkedIn stay in the contact list.
- Mute state is stored in `localStorage` as `csy20-dock-sound`.
- The dock stays on its dark chrome. The page background stays `rgb(10, 10, 10)`.
