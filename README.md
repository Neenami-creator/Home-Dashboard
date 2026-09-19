# Home Dashboard

A wall-mounted iPad dashboard for an old, iOS-locked iPad — built as a website (opened in
Safari, added to the Home Screen) rather than an App Store app. Next.js (App Router,
TypeScript, Tailwind), hosted on Vercel.

Four panels:

- **Hue** — room-by-room light control. Ready.
- **Spotify** — Sonos playback control. Ready (transport controls; starting a specific
  playlist on Sonos is a known-flaky stretch feature, not yet built).
- **BOM Weather** — current conditions and forecast. Built, but the Adelaide station/forecast
  codes are unverified — see below before relying on it.
- **Recipe Library** — searchable recipe cards. Ready, but requires you to run a one-off SQL
  migration against your Supabase project first — see below.

All four panels are built, and share a dark glass design system: warm accent colors per
panel, a live clock, a persistent panel-switcher in the header, and Fraunces (a display
serif) for the clock, temperatures and titles, paired with Geist Sans for everything else.
Motion (spring-based toggles, staggered tile entrances, crossfading Spotify artwork/track
titles) runs throughout rather than instant snaps.

The home screen is a live glance, not just a menu: each tile shows what's actually
happening — how many lights are on, what's playing, the current temperature, how many
recipes are saved — falling back to a static description the moment anything isn't
configured or reachable. The Spotify panel also tints its glow and progress bar to the
dominant color of whatever album art is showing, and the whole dashboard's background glow
shifts through the day (warmer at dawn/dusk, dimmer overnight) rather than looking identical
at 7am and midnight.

If Hue, Weather or Spotify can't be reached on load (WiFi hiccup, bridge rebooting), each
falls back to its last-known state with a small "showing last known state" badge instead of
a blank screen — see `src/lib/cache.ts`.

Recipes open in a light cooking mode: tap an ingredient to check it off while you go, and
the screen is kept awake (Screen Wake Lock API, where supported) for as long as a recipe is
open, since flour-covered hands aren't available to keep tapping the screen awake.

After 5 minutes idle, the dashboard becomes a clock (and photo frame, if configured) — see
**Idle screensaver** below.

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
(`/clip/v2/resource/room`, `/clip/v2/resource/grouped_light`), then subscribes to the
bridge's event stream (`/eventstream/clip/v2`) so tiles update the instant a light changes —
from this panel, the Hue app, a physical switch, or a schedule — rather than waiting for a
poll. A 60-second poll runs alongside it purely as a safety net in case the stream drops; the
small dot next to "Forget this bridge" shows whether the stream is currently live.

Each room also shows its real Hue **scenes** (Relax, Concentrate, whatever's configured in
the Hue app) via `/clip/v2/resource/scene`, alongside the dashboard's own generic color
presets — recalling a scene is how most people actually use smart lighting day to day.

## Routines

One-tap shortcuts on the home screen — "Eating dinner," "Cooking," "Watching a movie" ship
by default — that apply a Hue scene to one or more rooms at once (and, optionally, pause
Spotify) without opening the Hue panel. Assign scenes per room on the **Settings** screen
(gear icon in any panel header, or the gear next to the routine buttons on the home screen);
add custom routines there too. Routines live in `localStorage`, same as the rest of this
app's per-device settings — there's no server-side routines table.

## Settings screen

A single screen (gear icon, top-right of any panel) for everything that was previously only
reachable by re-triggering a panel's first-run setup form: reconfigure or forget the Hue
bridge, reconnect or disconnect Spotify, edit routines, and see whether the recipe library's
Supabase connection is configured.

## Dashboard access PIN

Optional, and off by default. Without it, anyone who finds the deployed URL can control your
lights and Spotify — there's no login screen otherwise. Set `DASHBOARD_PIN` and
`DASHBOARD_SESSION_SECRET` (see `.env.example`) and every route redirects to a PIN entry
screen until unlocked; the unlock is remembered for a year via an `httpOnly` cookie, so a
wall-mounted device only needs it entered once. Implemented as Next.js middleware
(`src/middleware.ts`) — this Next.js canary calls that convention deprecated in favor of a
`proxy.ts` rename, but it still fully works; revisit if a future Next upgrade removes it.

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

Spotify's Web API has no push mechanism for playback state, so this panel polls — but
adaptively: every 5 seconds while something's playing, backing off to every 25 seconds when
idle, and immediately after any button you tap here regardless of that timer.

### Sonos multi-room grouping

A genuinely separate integration from Spotify — Spotify's Web API has no concept of speaker
grouping at all; combining speakers to play in sync is entirely a Sonos feature, reachable
only through Sonos's own **Control API**. This is the least certain piece of this whole app:
**UNVERIFIED FROM THIS BUILD ENVIRONMENT** — the token endpoint, the households/groups
endpoints, and the confidential-client OAuth exchange in `src/lib/sonos/server.ts` are built
from documentation knowledge with no live Sonos developer account to check them against, and
Sonos's Control API has less community-tool precedent to lean on than Hue's or BOM's
undocumented-but-well-trodden endpoints. Confirm against
[developer.sonos.com](https://developer.sonos.com) before relying on it, and expect to patch
one or two endpoint paths in `src/lib/sonos/client.ts` or `server.ts` if they've drifted.

Setup, once you have a Sonos developer account:

1. Create a Control integration and note the **Client ID** and **Client Secret**.
2. Add `<your-deployed-url>/api/sonos/callback` as the redirect URI.
3. Set `NEXT_PUBLIC_SONOS_CLIENT_ID` and `SONOS_CLIENT_SECRET`. Unlike Spotify, Sonos's OAuth
   needs a real secret — kept server-only, used only by the two routes under `/api/sonos`.
4. In the Spotify panel, **Connect Sonos** appears once the Client ID is set. Select two or
   more speakers to group them, or adjust a group's volume with its slider.

## Weather panel setup

BOM has no documented, key-based API. The panel proxies (server-side, to dodge CORS) BOM's
public JSON mirrors of its FTP product files — the same undocumented endpoints existing
community weather tools already parse:

- Observations: `https://www.bom.gov.au/fwo/<product>/<product>.<station>.json`
- Forecast: `https://www.bom.gov.au/fwo/<product>/<product>.<AAC>.json`

Adelaide ships built in (product `IDS60901` / station `94648` for observations, product
`IDS10044` / area code `SA_PW001` for forecast) — **these codes could not be verified from
the build environment (no network route to bom.gov.au there) and should be checked against
real output once deployed.** If a city shows no data, open
`https://www.bom.gov.au/fwo/<product>/<product>.<code>.json` directly in a browser to check
the codes still resolve, and adjust `BUILT_IN_CITIES` in `src/lib/weather/cities.ts` if not.

Roxby Downs, Whyalla, or any other town: use the **+ Add city** button in the panel. BOM
doesn't publish a lookup for these codes, so find them by browsing to the town's page on
[bom.gov.au/places](http://www.bom.gov.au/places/), opening the browser's network tab, and
copying the product/station/AAC codes out of the `.json` request URLs for its observation and
forecast pages.

This is, by nature of being built on undocumented public data files rather than a supported
API, the panel most likely to need a small fix if BOM changes its format — the parsing in
`src/app/api/weather/route.ts` is written defensively (falls back to "unavailable" rather
than crashing) for exactly that reason.

### Rain radar

Below the forecast, a looping rain radar image for whichever city is selected — if it has a
`radarId` (Adelaide ships with `IDR643`, also **unverified from this build environment**).
BOM has no radar API at all, so `src/app/api/weather/radar/route.ts` scrapes the current
frame timestamps out of the public loop page's embedded JavaScript
(`bom.gov.au/products/<radarId>.loop.shtml`) — this is a step more fragile than the JSON
mirrors the rest of the panel uses, since it depends on that page's HTML structure rather
than a stable file naming convention. It degrades to showing the static map with no rain
overlay (and a small warning) if the scrape finds nothing, rather than breaking. Add a radar
ID for any other city via the **+ Add city** form's optional field; find one by opening that
town's radar loop page on bom.gov.au and reading the ID out of the URL.

## Recipe library setup

Reuses the existing Wardrobe Edit Supabase project (org Nina, project `the-wardrobe-edit`,
ref `ezvmsyneahnprupozorz`) rather than a new project, since that account is already at its
2-project free-tier cap. **This build environment has no credentials for that project**, so
the migration below hasn't been applied — you'll need to run it yourself.

1. Open that project's SQL Editor and run the whole of `supabase/migrations/0001_recipes.sql`.
   It creates a `recipes` table and a `recipe-photos` storage bucket, both fully separate
   from Wardrobe Edit's existing tables, its `profiles` table, and its per-user auth. RLS is
   public-read / no public write — there's no login concept for a shared household resource.
2. From that project's **Project Settings → API**, copy the **Project URL**, the
   **anon / publishable key**, and the **service role key** (this one is secret — server-only,
   never `NEXT_PUBLIC_`) into your environment.
3. Choose a passcode for the upload page and set it as `RECIPE_UPLOAD_PASSCODE`.
4. Set all four in `.env.local` for development, and as Vercel environment variables (all
   environments) for production.

Once configured: a searchable gallery (title, tags, ingredients all match), a recipe detail
page with a stats row (yield/prep/rise/cook/oven), two-column ingredients/method, numbered
steps, a note callout, and a servings scaler that adjusts ingredient amounts. **+ Add
recipe** opens a passcode-gated upload form; photos are resized to at most 1600px and
re-encoded as JPEG in the browser before upload, to stay within the shared 1GB storage quota.
New recipes appear immediately — no redeploy needed, since the upload route writes straight
to Supabase.

Run `supabase/migrations/0002_shopping_list.sql` too, for the **shopping list** (reachable
from the cart icon in the Recipes panel). Unlike `recipes`, this table is public read *and
write* — no passcode — since it's meant to be checked off directly from the dashboard with
nothing but the anon key. Each recipe's "Add to shopping list" button merges its ingredients
into any existing unchecked item with the same name and unit when both amounts are plain
numbers (so "2 eggs" + "3 eggs" becomes one "5 eggs" row); anything else is added as its own
row rather than risk merging the wrong things.

Run `supabase/migrations/0003_screensaver_photos.sql` for the **screensaver photos** bucket
used by the idle screensaver (see below) — upload photos from Settings, gated by the same
`RECIPE_UPLOAD_PASSCODE`.

## Idle screensaver

After 5 minutes without a touch, the dashboard dims to a full-screen clock and current
conditions rather than sitting on whatever panel was last open — an OLED/LCD burn-in
precaution for a display that's mounted permanently, and a reason to glance at it in the
first place. If any photos have been uploaded (Settings → Screensaver photos), it becomes a
slow-rotating digital photo frame with the clock overlaid instead of a bare clock, crossfading
every 15 seconds. Any tap, click or key press wakes it back to exactly where it was.

## Offline resilience

A `public/sw.js` service worker (registered by `ServiceWorkerRegistration`) caches this
app's own pages and static assets so a total WiFi outage shows this app's own UI — which, per
the stale-state fallback above, still has something to say — instead of the browser's blank
offline error page. Deliberately hands-off about it: it never touches API routes or
cross-origin requests (the Hue bridge, BOM, Spotify, Supabase all always hit the network
live), and it doesn't precache a build-time asset manifest (Next's chunk hashes change every
deploy, which would make a baked-in list go stale) — instead it's stale-while-revalidate for
static assets and network-first-with-cache-fallback for page navigations, both populated
naturally as the dashboard is used.

## Local development

```bash
npm install
cp .env.example .env.local     # fill in Hue / Spotify / Supabase values as you set each up
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
