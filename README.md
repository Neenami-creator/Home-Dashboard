# Home Dashboard

A wall-mounted iPad dashboard for an old, iOS-locked iPad — built as a website (opened in
Safari, added to the Home Screen) rather than an App Store app. Next.js (App Router,
TypeScript, Tailwind), hosted on Vercel.

Four panels:

- **Hue** — room-by-room light control. Ready.
- **Spotify** — Sonos playback control. Ready (transport controls; starting a specific
  playlist on Sonos is a known-flaky stretch feature, not yet built).
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

## Spotify panel setup

1. Create a free app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
   and note the **Client ID** — there's no client secret to manage, since the panel uses the
   PKCE auth flow entirely from the browser.
2. In the app's settings, add these **Redirect URIs**:
   - `<your-deployed-url>/spotify/callback`
   - `http://127.0.0.1:3000/spotify/callback` (for local development)
3. In the Sonos app, confirm Spotify is added as a linked music service (not just cast to via
   another app) — that's what makes a Sonos speaker show up as a Spotify Connect device.
4. Open the Spotify panel and either paste the Client ID into the one-time connect form, or
   set `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` at deploy time so the form is skipped.
5. Tap **Connect with Spotify** and log in. Requires Spotify Premium for playback control.

Once connected: now-playing card with play/pause/skip/volume, and a device picker to switch
between Sonos speakers. Transport controls on whatever's already playing are reliable;
starting a specific playlist or album on a Sonos device from scratch is a known Sonos/Spotify
limitation and isn't built here yet.

## Local development

```bash
npm install
cp .env.example .env.local     # optional: pre-fill Hue bridge / Spotify Client ID
npm run dev
```

Open http://127.0.0.1:3000 (not `localhost`, since a Spotify redirect URI must match
exactly). Since the Hue bridge is LAN-only, the Hue panel only works when this device is on
the same network as the bridge.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import it into Vercel, framework preset **Next.js**.
3. Add any of the environment variables in `.env.example` you want baked in at build time.
4. Deploy, then open the deployed URL in Safari on the iPad and **Share → Add to Home
   Screen**.
