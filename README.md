# MyFlix

A private, single‑user **"Netflix for myself"** — a self‑hosted streaming front‑end for your own
movie & TV library. [Jellyfin](https://jellyfin.org) does the heavy lifting (transcoding, HLS
adaptive streaming, TMDB metadata, storage) and a custom **React + TypeScript** app gives it a
polished, modern, Netflix‑style UI.

```
Browser ──HTTPS──▶ Caddy ──/──────────▶ React SPA (static, built by Vite)
                       └──/jellyfin/───▶ Jellyfin (REST API · HLS · images)
```

Everything is meant to be reached privately over **Tailscale / WireGuard** — no public ports
required. It's built for one user, which removes the hardest parts of a real streaming service
(no DRM, no CDN, no multi‑tenant scaling).

---

## Table of contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
  - [1. Jellyfin + Caddy (the server)](#1-jellyfin--caddy-the-server)
  - [2. Frontend — develop locally](#2-frontend--develop-locally)
  - [3. Frontend — build & ship](#3-frontend--build--ship)
- [Configuration](#configuration)
- [How it works](#how-it-works)
- [Development](#development)
- [Implementation notes & gotchas](#implementation-notes--gotchas)
- [Roadmap](#roadmap)
- [Disclaimer](#disclaimer)

---

## Features

**Browsing & discovery**
- Cinematic **home page** with a rotating, auto‑playing hero (Ken Burns zoom, crossfade, parallax)
- Rows for **Continue Watching**, **Next Up**, **My List**, **Top Picks**, **Because you watched…**,
  **Recently Added**, **Collections**, a numbered **Top 10**, and per‑**genre** rows
- **Library** pages with sort (title / newest / release / rating / runtime), **genre**, **decade**,
  and **unwatched‑only** filters, plus infinite‑scroll pagination
- **Collections / franchises** (Jellyfin BoxSets) as their own browsable pages
- **Search** with an instant results dropdown (movies, shows, collections **and** people) and recent
  searches, plus a full search page
- **Person pages** — click any cast member to see their filmography
- **Rich detail pages** — backdrop, title logo, tagline, ratings, runtime, genres, cast, director/
  writers, studios, **trailers** (YouTube modal), **"More Like This"**, and "Part of the X Collection"

**Playback**
- Adaptive **HLS** streaming via Jellyfin (FFmpeg / Intel Quick Sync hardware transcoding)
- **Direct‑play** when the browser supports the file; transcode otherwise
- In‑player **quality** selector (Auto → 4K / 1080p / 720p / 480p), **audio‑track** switching, and a
  **subtitles** selector (text *and* image/PGS subs, burned in on demand)
- **Resume** playback, progress reporting, **Continue Watching** (with dismiss), **Skip Intro**
  (when chapter data exists), and **autoplay next** episode / next film in a collection
- **TV support** — Series → Seasons → Episodes, a Series page with episode list, and "Next Up"

**Design & UX**
- Refined cinematic dark theme with an indigo/violet accent, **Inter** + **Space Grotesk** type
- **Dynamic color** — the page's ambient glow tints to the dominant color of whatever you're viewing
- **BlurHash** image placeholders, **framer‑motion** page transitions + scroll reveal, hover quick
  actions (Play / + My List), film grain, shimmer skeletons
- **My List** (favorites) and **watched / unwatched** toggles, with toasts
- **Responsive** — reflowing navbar and on‑page search for phones; touch‑friendly player
- **Settings** page (default quality, clear local data), `/` to focus search, `prefers-reduced-motion`

**Engineering**
- Strongly‑typed Jellyfin REST client, **TanStack Query** caching, error boundary + global error toasts
- Code‑split player route, **ESLint + Prettier**, **Vitest** unit/component tests

## Screenshots

> _Add screenshots/GIFs here (home, detail, player, collections, mobile)._

## Tech stack

| Layer            | Choice                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| Media engine     | **Jellyfin** (FFmpeg/Quick Sync transcoding, HLS, TMDB metadata)       |
| Frontend         | **React 18 + TypeScript + Vite**                                       |
| Styling          | **Tailwind CSS** (custom design tokens), Inter + Space Grotesk         |
| Data fetching    | **TanStack Query** (incl. infinite queries)                            |
| Player           | **Vidstack** (`@vidstack/react`) over hls.js                           |
| Motion           | **framer-motion**                                                      |
| Routing          | **React Router**                                                       |
| Toasts / icons   | **sonner** / **lucide-react**                                          |
| Reverse proxy    | **Caddy** (automatic HTTPS, serves SPA + proxies Jellyfin)             |
| Remote access    | **Tailscale / WireGuard** (private, no exposed ports)                  |
| Tests / lint     | **Vitest** + Testing Library, **ESLint** (flat config) + **Prettier**  |

## Architecture

The frontend is a static SPA that talks to Jellyfin's REST API over a **single same‑origin host**:

- In **production**, Caddy serves the built SPA at `/` and reverse‑proxies `/jellyfin/*` to the
  Jellyfin container. Jellyfin's **Base URL** is set to `/jellyfin` so the prefix is preserved.
- In **development**, Vite's dev server proxies `/jellyfin/*` to your Jellyfin instance (stripping
  the prefix), so the browser still sees one origin and there are no CORS issues.

The app always calls the API at `/jellyfin` — only the proxy layer differs between dev and prod.

## Repository layout

```
myflix/
├── docker-compose.yml      # jellyfin + caddy
├── .env.example            # server config (domain, media path, timezone)
├── caddy/Caddyfile         # serves the SPA at / and proxies Jellyfin at /jellyfin
├── dev.ps1                 # one-command local dev launcher (Windows)
└── frontend/               # React + TS + Vite app
    ├── src/
    │   ├── api/            # typed Jellyfin client (auth, items, images, playback, device profile)
    │   ├── components/     # PosterCard/Row, Hero, Navbar, player bits, skeletons, etc.
    │   ├── context/        # AuthContext
    │   ├── hooks/          # TanStack Query hooks + helpers
    │   ├── lib/            # query client, formatting, blurhash, chapters
    │   └── pages/          # Home, Library, Detail, Series, Collection, Person, Search, MyList, Settings, Player, Login
    ├── eslint.config.js · .prettierrc.json · vitest.config.ts
    └── vite.config.ts      # dev proxy to Jellyfin
```

> The local dev Jellyfin instance and sample media live under `myflix/.dev/` and are **gitignored**
> (the binary is large and `session.json` holds an access token).

## Prerequisites

- **Node 18+** and npm (frontend dev/build)
- A **Jellyfin** server reachable from your machine. For production: a Linux host (Debian/Ubuntu)
  with **Docker + Docker Compose**, an Intel CPU with **Quick Sync** (`/dev/dri`) for hardware
  transcoding, and your media on a mounted volume.
- **Tailscale** (or WireGuard) on the host for private remote access (optional but recommended).

## Quick start

### 1. Jellyfin + Caddy (the server)

```bash
cp .env.example .env
# edit .env: DOMAIN, MEDIA_PATH, PUBLIC_URL, TZ
#
# Find your render/video group GIDs for Quick Sync and set them in docker-compose.yml:
getent group render video

docker compose up -d
```

Then open Jellyfin's first‑run wizard at `https://<DOMAIN>/jellyfin` and:

1. Create your user and add your movie/TV libraries (TMDB metadata is built in).
2. **Dashboard → Networking → Base URL → `/jellyfin`** (required — the proxy keeps this prefix).
3. **Dashboard → Playback → Transcoding → enable Intel QuickSync (QSV)** and confirm `/dev/dri`.

### 2. Frontend — develop locally

```bash
cd frontend
cp .env.example .env.local        # set VITE_JELLYFIN_TARGET to your Jellyfin server
npm install
npm run dev                       # http://localhost:5173
```

Log in with your Jellyfin username/password. The Vite proxy points `/jellyfin` at your server, so
there's nothing else to configure.

### 3. Frontend — build & ship

```bash
docker compose up -d --build      # builds the SPA and serves it via Caddy
```

The root `Dockerfile` is a multi‑stage build that compiles the SPA and bakes it into the Caddy
image, so `docker compose up --build` is fully self‑contained — no manual host build required. The
`Caddyfile` is still bind‑mounted, so reverse‑proxy/security‑header tweaks don't need a rebuild
(`docker compose restart caddy`). The SPA is served at `/` with history‑API fallback.

> Prefer building on the host? `cd frontend && npm run build` still outputs `frontend/dist`.

## Configuration

**Server (`.env`)**

| Var          | Purpose                                                               |
| ------------ | --------------------------------------------------------------------- |
| `DOMAIN`     | Public hostname Caddy serves HTTPS on (or your `*.ts.net` tailnet name) |
| `MEDIA_PATH` | Absolute host path to your library (mounted read‑only)                |
| `PUBLIC_URL` | How Jellyfin advertises itself (`https://<DOMAIN>/jellyfin`)          |
| `TZ`         | Container timezone                                                    |

**Frontend (`frontend/.env.local`, dev only)**

| Var                    | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `VITE_JELLYFIN_TARGET` | Where Vite proxies `/jellyfin` (your server URL)   |

**Streaming quality** lives in `frontend/src/api/config.ts` (`STREAM_MAX_BITRATE`, `STREAM_MAX_WIDTH`)
and the per‑player tiers in `src/pages/Player.tsx`.

## How it works

- **Auth** — the app does a real Jellyfin `AuthenticateByName` login and stores the access token +
  device id locally. A 401 anywhere clears the session and redirects to login.
- **Playback** — `POST /Items/{id}/PlaybackInfo` with a browser device profile decides direct‑play vs.
  transcode and returns an HLS `TranscodingUrl`. The player always requests a full‑length stream and
  seeks client‑side, so scrubbing works across the whole title.
- **Quality** — the device profile caps bitrate/resolution; the player rewrites these to switch tiers
  (the **4K** tier keeps native resolution; lower tiers downscale to save CPU/bandwidth).
- **Subtitles** — selected subtitles are **burned in** server‑side; the exact index (or `-1` for off)
  is forced into the transcode URL, which reliably supports both text and image (PGS) subtitles.
- **Collections** — Jellyfin BoxSets are surfaced as rows and pages; a membership map links a movie to
  its collection and powers autoplay‑next.
- **Dynamic color** — a title's dominant color is derived from its BlurHash and applied to the page's
  ambient glow.

## Development

From `frontend/`:

| Script             | What it does                          |
| ------------------ | ------------------------------------- |
| `npm run dev`      | Vite dev server (proxying Jellyfin)   |
| `npm run build`    | Type‑check + production build         |
| `npm run preview`  | Preview the production build          |
| `npm run lint`     | ESLint                                |
| `npm run format`   | Prettier write                        |
| `npm run test`     | Vitest                                |

On Windows, `dev.ps1` boots the local Jellyfin instance **and** the frontend together
(`.\dev.ps1`, `.\dev.ps1 -Stop` to halt). On **macOS / Linux**, `./dev.sh` installs deps (first run)
and starts the frontend dev server against the Jellyfin you point at in `frontend/.env.local`
(`./dev.sh --stop` to halt).

CI (`.github/workflows/ci.yml`) runs **lint → typecheck → test → build** on every push and PR.

## Implementation notes & gotchas

- **Same‑origin everywhere** — the app calls `/jellyfin/*`; dev (Vite) strips the prefix, prod (Caddy)
  keeps it with Jellyfin's Base URL set to `/jellyfin`.
- **Subtitles** — Jellyfin's `PlaybackInfo` ignores `SubtitleStreamIndex=-1` and auto‑burns a file's
  default subtitle, so the chosen index is forced directly into the transcode URL instead.
- **Composite tsconfig** — `tsconfig.node.json` redirects emit into `node_modules/.tmp` so `tsc -b`
  doesn't drop a `vite.config.js` that would shadow `vite.config.ts`.
- **Collections aren't auto‑created** by vanilla Jellyfin — they're created/identified against TMDB.

## Roadmap

- Deploy to the Linux server with Docker + Caddy + **Tailscale** and validate Quick Sync
- **PWA** (installable, offline shell, app icon)
- Custom Vidstack player skin
- Enable the Content‑Security‑Policy (drafted in `caddy/Caddyfile`) after verifying playback

**Recently done:** window‑virtualized library grid, player error/retry UI + beacon‑accurate resume
reporting, security headers (Caddy + Vercel) with token redaction, multi‑stage Docker build, CI, and
a macOS/Linux dev launcher.

## Disclaimer

MyFlix is a personal project for streaming **your own** legally‑obtained media to yourself. It ships
no content. You are responsible for how you use it.
