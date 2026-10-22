# FITME website

Lightweight, static, mobile-friendly website for the **FITME** Android app by Gymlover Deepak.
Built with Vite + React. No backend, no database, no API keys. Deploys to Vercel as a static site.

This folder is separate from the FITME Android app (one level up). The app's Metro bundler and ESLint
are configured to ignore this folder, so the website never affects the app build.

## Run locally

Requires Node.js 20+.

```powershell
cd D:\FitMe\fitme-website
npm install
npm run dev        # opens a local dev server, usually http://localhost:5173
npm run build      # production build into ./dist
npm run preview    # serve the production build at http://localhost:4173
```

## Configure the APK download link

The **DOWNLOAD APK** button is disabled and shows *“APK coming soon”* until a real download link is set.
The site never invents a link.

Settings (all **public** — they are visible in the browser, so never put secrets here):

| Variable | Required | Example | Shown on the site |
| --- | --- | --- | --- |
| `VITE_APK_URL` | Yes, to enable the button | `https://github.com/<you>/<repo>/releases/download/v1.1.0/FITME-v1.1.0.apk` | Button opens this link |
| `VITE_APK_VERSION` | Optional | `1.1.0` | “Version 1.1.0” under the button |
| `VITE_APK_SIZE` | Optional | `38.4 MB` | Size under the button |

Only `https://` links are accepted. Fill in version and size from the real APK file.

**Locally:** copy `.env.example` to `.env.local`, fill in the values, then run `npm run build` (or `npm run dev`).

**On Vercel:** Project → **Settings → Environment Variables** → add the variables → **Deployments → … → Redeploy**.
Vite reads these at build time, so a redeploy is required after changing them.

### Where to host the APK

Recommended: **GitHub Releases** (free, built for binary downloads).

1. On GitHub, open your repository → **Releases** → **Draft a new release**.
2. Create a tag such as `v1.1.0`, add a title and release notes.
3. Drag the APK file into **Attach binaries**, then **Publish release**.
4. Right-click the APK under **Assets** → **Copy link address**. That link is your `VITE_APK_URL`.

Do not commit the APK into the normal source code history.

## Deploy to Vercel through GitHub

1. Push the project to a GitHub repository (the Android app and this `fitme-website` folder can live in the same repo).
2. Sign in at https://vercel.com with GitHub → **Add New… → Project** → import the repository.
3. In the import screen:
   - **Root Directory:** `fitme-website`
   - **Framework Preset:** Vite (detected automatically)
   - Build command `npm run build`, output directory `dist` (defaults)
4. Add the environment variables above (you can skip them for now — the button will show “APK coming soon”).
5. Click **Deploy**. Every push to the main branch redeploys automatically.

## Project structure

```
fitme-website/
  index.html               Page title, SEO description, favicon, Open Graph tags
  src/
    config.js              APK settings (from env vars), contact email, social links
    App.jsx, main.jsx      Page layout
    components/            Header, Hero (download button), Features, Screenshots, Install, Footer
    styles.css             Black & neon-green design, responsive layout, reduced-motion support
    useReveal.js           Subtle fade-in on scroll
  public/
    logo.png               The GYM LOVER Deepak logo (copied from the app's assets)
    favicon.png, apple-touch-icon.png, og-image.jpg
    screenshots/           Real screenshots of the app on a Galaxy Z Fold6
  scripts/prepare-images.ps1   Regenerates the images above from the app's assets
  .env.example             Template for the download settings
```

## Notes

- Feature descriptions match FITME v1.1.0. Update `src/components/Features.jsx` when the app changes.
- Open Graph image URLs are relative (`/og-image.jpg`). Most platforms resolve them against your site; for
  best results on every platform, change them to your full Vercel URL in `index.html` after the first deploy.
