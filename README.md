# Show Me Hydro (Claude concierge)

Minimal livestream-style dashboard with a Claude guide for RDWC growers.

## Quick start (local)
1) Install deps:
```
npm install
```
2) Add your OpenAI key:
```
echo OPENAI_API_KEY=your_key_here > .env
```
3) Run the server:
```
npm start
```
4) Open the UI: http://localhost:3000

## Deploy to Netlify (OpenAI via serverless)
1) In Netlify site settings → Environment variables, add `OPENAI_API_KEY`.
2) Push this repo to Git and connect the repo to Netlify.
3) Build settings: Base directory `.` · Build command: _none_ (static) · Publish directory `public` · Functions directory `netlify/functions`.
4) Netlify will serve the frontend and the `/.netlify/functions/claude` endpoint. The included redirect maps `/api/claude` → `/.netlify/functions/claude`.
5) For local dev with Netlify: install the CLI `npm i -g netlify-cli` then run `netlify dev` and open the shown URL.

## What it does
- Livestream-style panel (placeholder video) with running log.
- Sensor grid and device badges using sample values.
- Concierge via `/api/claude`, using `gpt-4o-mini`.

## Notes
- Replace the video source in `public/index.html` by updating `data-src` on the `<video id="live-video">` element with your HLS H.264 playback URL. OBS usually pushes RTMP to a service (Livepeer/Cloudflare/Mux/etc.); use that service’s HLS playback URL.
- `public/app.js` loads HLS with hls.js when needed, and falls back to native HLS support where available.
- The OpenAI call uses `fetch` server-side to avoid browser CORS issues.
- If Claude is unreachable, a safe fallback tip is shown.

