---
date: 2026-10-01
type: restructure-notes
status: complete
tags: [strata-games, bgg-app, backend, refactor, bgg-api]
---

# Backend restructure — modularized to match Segla's shape

Step 1 of getting Strata Games (`bgg-app`) ready to move to VM1, following the same
path as Segla (`finance-app`). This is a structural/modularization pass only — no
auth, no Docker production hardening, no port changes, no frontend changes. See
`Strata Games Migration.md` in the homelab vault for the full multi-step plan this
fits into.

## What changed

### 1. Backend split into `src/{app.js,controllers/,routes/}`

**Before:** one 544-line `backend/app.js` with every route handler written inline,
calling into one 791-line `backend/controllers/controllers.js` that held all 40+
functions for every domain (games, groups, players, sessions, BGG calls) in a single
file. No routes layer existed.

**After:**

```
backend/
  package.json, knexfile.js, migrations/      (unchanged)
  src/
    app.js                  slim: middleware + mount routers + listen
    controllers/
      dbConnection.js        moved as-is, import path to knexfile.js updated
      gamesController.js     games + their attribute joins (accessories, artists,
                              categories, compilations, designers, expansions,
                              families, implementations, mechanics, publishers),
                              getMyGamesDb, batchUpdateGameRanks, patchGameFavorite,
                              deleteGame, getDifference
      groupsController.js    postGroup, getGroups, deleteGroup, patchGroup,
                              postGamesGroups, deleteGamesGroups
      playersController.js   getPlayers, getPlayersByIds, postPlayer, patchPlayer,
                              doesPlayerHaveSessions, deletePlayer
      sessionsController.js  postSession, postSessionPlayers, getSessions,
                              deleteSession
      bggController.js       hot-games, specific-games, user-games, user-wishlist,
                              friends - see below, this one also changed behavior
    routes/
      gamesRoutes.js, groupsRoutes.js, playersRoutes.js, sessionsRoutes.js,
      bggRoutes.js            one Router per domain, mounted in app.js with no
                               path prefix - every URL is identical to before
                               (/db-my-games, /session, /hot-games, etc.)
```

No route paths changed, no response shapes changed, no DB query logic changed for
games/groups/players/sessions - this was a pure move-and-split of existing code.
Stayed CommonJS (`require`/`module.exports`), matching what this repo already used -
Segla's current `server/src` is ES modules, but that's from its later auth-era
revision, not its original modularization; converting module systems here would be
an unrelated, higher-risk change nobody asked for.

`backend/package.json`'s `start` script now points at `src/app.js` instead of
`app.js`. `backend/Dockerfile` needed no changes - it already does `COPY . /app` +
`npm start`, which still works since only internal paths moved.

### 2. Removed the `cors-anywhere` proxy

**Before:** every BGG call went `backend -> cors-anywhere-server (Docker container,
port 8080) -> boardgamegeek.com`, hitting `www.boardgamegeek.com` through the proxy
with a spoofed `Origin: http://localhost:3000` header.

**After:** `bggController.js` calls `boardgamegeek.com` (no `www`) directly with
`Authorization: Bearer ${BGG_API_KEY}`. `cors-server/` (the whole directory) and the
`cors-anywhere-server` service in `docker-compose.yaml` are deleted.

**Why this is safe, verified empirically, not assumed:**

CORS is a browser-only restriction - it's the *browser's* JS engine that blocks
reading a cross-origin response; it is never enforced by a server-to-server HTTP
client like axios running in Node. A proxy that adds `Access-Control-Allow-Origin`
headers (what `cors-anywhere` does) cannot matter here, because nothing on this call
path is a browser. The classic "BGG + cors-anywhere" threads around the internet
(e.g. BGG's own [CORS thread](https://boardgamegeek.com/thread/2268761/cors-security-issue-using-xmlapi))
are specifically about a **frontend** calling BGG directly via `fetch`/`XHR` - a
different architecture than this app's actual call path (backend calls BGG from
Node).

Confirmed directly with curl, no proxy involved at all:

```
curl .../xmlapi2/hot?boardgame                                    -> 401 Unauthorized
curl .../xmlapi2/hot?boardgame -H "Authorization: Bearer <key>"    -> 200 OK, real data
```

What *was* real, and is what the old code was actually fighting: BGG added a
mandatory `Authorization: Bearer <token>` requirement to the XML API in 2025 (see
[BGG's announcement thread](https://boardgamegeek.com/thread/3600185/heads-up-bgg-now-requiring-authorization-tokens-fo)),
and the old code targeted `www.boardgamegeek.com`, which 301-redirects to the bare
host - a redirect that silently drops the `Authorization` header in some HTTP
clients (confirmed hitting this with curl's default redirect handling while testing).
That combination - wrong host, dropped auth header - is almost certainly the real
source of the confusing 401s from early development, not CORS.

### 3. Cloudflare 403 risk - root-caused and FIXED (2026-10-01, during step 2's Wishlist work)

While testing the restructured `bggController.js` end-to-end against the live BGG
API, `/hot-games`, `/friends`, and `/user-wishlist` intermittently came back
`403 Forbidden` with a Cloudflare "Just a moment..." JS-challenge page. Originally
documented here (step 1) as an open hypothesis - "maybe the spoofed Chrome
`User-Agent` is making the bot-detection heuristic worse, not better." That
hypothesis is now confirmed, not speculative: a controlled same-request A/B test
from inside the actual `backend` container (one request with the hardcoded
`User-Agent: Mozilla/5.0 ... Chrome/91...` header, one without it, otherwise
identical) got `403` with the spoofed header and a clean `200` with axios's own
honest default. **Fix applied:** `bggController.js`'s `bggHeaders()` no longer
sends any `User-Agent` at all - just the `Authorization` header BGG actually
requires. Node's TLS handshake never matched a real Chrome's in the first place;
claiming to be Chrome anyway was the actual red flag, not camouflage.

This was **not a CORS problem and not an auth problem** - `cors-anywhere` was
never capable of fixing it (a proxy can't solve a JS challenge), so this isn't an
argument for bringing that proxy back.

One debugging note worth keeping: the challenge can be scoped to a specific
client/IP+pattern. While isolating this, direct `curl` from the WSL host kept
succeeding on demand while the Docker-containerized `backend` was consistently
403-challenged on the exact same endpoint/query - the container's own requests
throughout a long testing session had apparently gotten that specific outbound
path flagged longer than the host's. Don't assume "it works from curl on the
host" rules out a live problem in the running container - test from inside the
container itself (`docker exec backend node -e "..."` or similar) if a clean
host-side check looks fine but the app still 403s.

If this ever resurfaces despite the fix: reduce request frequency / add caching
for `hot-games` specifically (it's identical for every user, no reason to refetch
it per-request), and know that a sustained block would ultimately need BGG's
actual registered-application flow (the 2025 auth change was BGG moving toward
requiring registered, identified clients) - out of scope for this repo today.

## Explicitly deferred to later steps

- Auth / CORS allowlist / `helmet` - bgg-app has zero auth today, same as Segla
  before its own AUTH.md pass.
- Dockerfile production hardening (multi-stage build, non-root user, dropping the
  `./backend:/app` bind mount, Node version bump past the current `node:14-alpine`
  base) - Segla did this as its own later revision.
- Port remapping (currently 3001/3000 locally; 4010/4011 are reserved for Strata in
  the homelab's `Software Stack.md` for when it actually deploys).
- Frontend `serverCalls.js` still hardcodes `http://localhost:3001` at ~24 call
  sites - the direct equivalent of Segla's `REACT_APP_API_BASE_URL` fix, its own
  step.
- Migration file renaming - bgg-app uses sequential numeric prefixes
  (`001_create_my_games.js`) instead of Segla's timestamp convention. Knex tracks
  applied migrations by filename; left alone deliberately, no real benefit to
  renaming and real risk of breaking migration state.

## Verification performed

- `node --check` on every new/moved file - all clean.
- Booted `backend/src/app.js` directly with `node` (not Docker, no Postgres
  running) - started cleanly on port 3001.
- Hit `/db-my-games` through the running app - got the expected
  `ECONNREFUSED 127.0.0.1:5432` from knex (no Postgres running locally), silently
  swallowed into an HTTP 200 with an empty body by `getMyGamesDb`'s existing
  try/catch (this swallow-and-200 behavior is pre-existing, not introduced by this
  refactor - same as the original `controllers.js`).
- Hit `/hot-games`, `/specific-games`, `/friends` through the running app - BGG's
  Bearer-token auth path confirmed working end-to-end (see the Cloudflare note above
  for what didn't always succeed, and why).
- **Not yet done:** full `docker compose up -d --build` - Docker Desktop wasn't
  running when this pass finished. Do this before considering the step fully closed:
  confirm `database` and `backend` come up clean with `cors-anywhere-server` gone,
  and spot-check the frontend's collection view and hot-games carousel in a browser
  against the restructured backend.
