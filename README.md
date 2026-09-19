# Home Dashboard

A wall-mounted iPad dashboard for an old, iOS-locked iPad — built as a website (opened in
Safari, added to the Home Screen) rather than an App Store app. Next.js (App Router,
TypeScript, Tailwind), hosted on Vercel.

Four panels:

- **Hue** — room-by-room light control. Ready.
- **Spotify** — Sonos playback control. Coming next.
- **BOM Weather** — current conditions and forecast. Coming next.
- **Recipe Library** — searchable recipe cards. Coming last.

Functional-first; a dedicated visual design pass follows once all four panels work.

## Architecture

The app is hosted on Vercel. Spotify and BOM weather work from anywhere. Hue is the
exception: the bridge only accepts requests from its own local network, so the Hue panel's
JavaScript talks to the bridge's local IP directly from the browser — meaning Hue control
only works while the device is on home WiFi (which, for a wall-mounted dashboard, is where
it lives anyway).

## Hue panel setup

1. Find the bridge's local IP (Hue app settings, or `discovery.meethue.com`) and give it a
   fixed IP via a DHCP reservation in your router.
2. Press the physical link button on the bridge, then generate an application key by
   `POST`ing to `https://<bridge-ip>/api` with `{"devicetype": "home-dashboard"}` within the
   next 30 seconds.
3. Visit `https://<bridge-ip>` in Safari on the iPad once and accept the certificate
   warning — the bridge only serves HTTPS with a self-signed cert, and without this the
   dashboard's background requests to that address will silently fail.
4. Open the Hue panel. Either:
   - enter the bridge IP and application key in the one-time setup form, or
   - set `NEXT_PUBLIC_HUE_BRIDGE_IP` and `NEXT_PUBLIC_HUE_APP_KEY` at deploy time so the
     panel connects automatically.

The panel reads rooms and their grouped lights via the bridge's CLIP v2 API
(`/clip/v2/resource/room`, `/clip/v2/resource/grouped_light`) and polls every 15 seconds so
state stays in sync if lights are also controlled from the Hue app.

## Local development

```bash
npm install
cp .env.example .env.local     # optional: pre-fill Hue bridge details
npm run dev
```

Open http://localhost:3000. Since the Hue bridge is LAN-only, the Hue panel only works when
this device is on the same network as the bridge.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import it into Vercel, framework preset **Next.js**.
3. Add any of the environment variables in `.env.example` you want baked in at build time.
4. Deploy, then open the deployed URL in Safari on the iPad and **Share → Add to Home
   Screen**.
