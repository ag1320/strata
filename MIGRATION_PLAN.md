---
date: 2026-10-01
type: migration-plan
status: in-progress
tags: [strata-games, bgg-app, migration, vm1, roadmap]
---

# Strata Games (bgg-app) -> VM1 migration plan

**If you're a future Claude session picking this up cold: read this file first, then
`BACKEND_RESTRUCTURE.md` in this same repo root for what step 1 actually did. The
homelab Obsidian vault has the broader context and the deployment-specific how-to:**

- `Home Lab/Guides/Phase 2 - Existing Hardware Expansion/Actions/Strata Games Migration.md`
  - the Strata-specific migration guide (was a draft/pre-migration plan as of last
    read - cross-reference it, it may have been updated)
- `Home Lab/Guides/Phase 2 - Existing Hardware Expansion/Actions/Segla Server Migration.md`
  - the completed migration for Segla (`~/finance-app`), the sibling app this repo is
    following the same path as. Same stack (Node/Express + React + Postgres +
    Knex), same target host (VM1, Docker, Caddy). Read this for the concrete
    deployment mechanics (Caddy config, DNS, ddclient, pg_dump/restore, the Docker
    production-hardening fixes) - Strata's own guide is intentionally generic/
    unverified until each step below actually happens against this repo.

This plan exists because the user wants to work through the migration **one step at
a time** (ran low on context mid-work during the Segla migration once already) -
don't try to do everything below in one session unless explicitly asked.

## Status

- [x] **Step 1 - Modularize the backend** (done 2026-10-01). Split the monolithic
      `app.js`/`controllers.js` into Segla's `src/{app.js,controllers/,routes/}`
      shape, removed the unnecessary `cors-anywhere` proxy, fixed the BGG API host/
      auth. Full writeup, including a Cloudflare bot-challenge risk discovered while
      verifying: **`BACKEND_RESTRUCTURE.md`** (this repo root). Verified end-to-end
      against the real database via `docker compose up -d --build`.
- [ ] Step 2 - Security audit + auth
- [ ] Step 3 - Docker production hardening
- [ ] Step 4 - Frontend hardcoded API URL fix
- [ ] Step 5 - Port remapping
- [ ] Step 6 - Actual deployment to VM1
- [ ] Step 7 - Cutover + cleanup

## Step 2 - Security audit + auth (not started)

Mirrors Segla's `AUTH.md` pass, and is explicitly called out as required (not
optional) in `Strata Games Migration.md` §6a, since this app has never been
internet-facing before. Known findings already, from working on step 1 - don't
re-derive these, just fix them:

- **No auth at all.** Every route is open. Needs the same login/JWT-cookie pattern
  Segla got - see Segla's `AUTH.md` in `~/finance-app` for the exact shape
  (bcrypt password hash in `.env` via `npm run hash-password`, JWT in an httpOnly
  cookie, a login route, `requireAuth` middleware). **Generate a fresh JWT secret
  for this app - never reuse Segla's.**
- **Raw errors leak to clients.** Nearly every route handler in the new
  `backend/src/routes/*.js` does `.catch((error) => res.status(400).send(error))` or
  similar - sends the raw error object straight to the client. Segla fixed this with
  a small `utils/sendError.js` (log server-side, send a fixed generic message
  client-side) - see `~/finance-app/server/src/utils/sendError.js` for the exact
  pattern to copy. Deliberately **not** fixed in step 1 to keep that pass purely
  structural - fix it now.
- **CORS is wildcard** (`origin: "*"` in `backend/src/app.js`). Can't stay that way
  once auth adds credentialed (cookie-carrying) requests - browsers reject
  `Access-Control-Allow-Origin: *` combined with credentials. Needs the same
  `CORS_ORIGIN` env-var allowlist pattern Segla uses.
- **No `helmet`.** Needed once this sits behind Caddy on a public domain - and if
  Strata ends up on a split frontend/API subdomain pattern like Segla
  (`strata.keylimedesigns.dev` / `strata-api.keylimedesigns.dev`, naming TBD),
  `helmet`'s default `Cross-Origin-Resource-Policy: same-origin` needs the same
  override Segla needed (`crossOriginResourcePolicy: { policy: "cross-origin" }`).
- **`.env` has a plaintext DB password** (`DB_PASSWORD`) already gitignored
  correctly - just carry it over securely (NordPass note or similar), don't commit
  it, consider rotating it for the VM1 copy.
- Audit `.gitignore` for anything like a stray DB dump sitting in the repo
  (Segla had one slip through before this was caught).

Full pattern and reasoning: `Documentation/Security/Securing a Node-Express-React
App Before It Goes Public.md` in the homelab vault.

## Step 3 - Docker production hardening (not started)

Segla's `server`/`ui` Dockerfiles were dev-shaped and got fixed in one pass (see
Segla's `SERVER_MIGRATION.md` §9). bgg-app's `backend`/`frontend` Dockerfiles have
the exact same dev-shaped issues, confirmed while working on step 1:

- `backend/Dockerfile`: single-stage `RUN npm install` + `CMD npm start` (runs
  `nodemon`, a dev dependency, in "production"). `docker-compose.yaml` bind-mounts
  `./backend:/app` over the image's own install - the image's own `COPY` is nearly
  pointless, what actually runs is whatever's on the host disk. Needs: two-stage
  build (`npm ci --omit=dev`), move `nodemon` to devDependencies, drop the bind
  mount (trade-off: no more live-reload through Docker - edit + `docker compose
  restart backend`, or run `npm run dev`-equivalent on the host for live-reload),
  non-root user, add `backend/.dockerignore` (`node_modules`, `.env`, `.git`).
- `backend/Dockerfile` is still on `node:14-alpine` - 14 went EOL April 2023. Expect
  the same OpenSSL-3/webpack MD4 incompatibility Segla's `ui` hit when it bumped
  past Node 16 (`error:0308010C:digital envelope routines::unsupported`) - fix is
  `ENV NODE_OPTIONS=--openssl-legacy-provider` on the build stage only, **if** this
  app's frontend build hits the same issue (it uses CRA too, so likely yes).
- `frontend/Dockerfile`: check if it's running CRA's dev server (`react-scripts
  start`) the same way Segla's originally was - if so, same fix needed (two-stage
  build, serve the static bundle, since a dev server rejects unrecognized `Host`
  headers once this sits behind a real domain).
- Add `restart: unless-stopped` to all services in `docker-compose.yaml` - Segla
  needed this after `backend` lost a startup race against Postgres on a fresh
  volume and just stayed dead with no restart policy.
- **Verify by actually building and running the image**, not just by reasoning about
  the Dockerfile - that's what caught the real OpenSSL incompatibility and the
  Postgres startup race for Segla, neither of which static reasoning alone found.

## Step 4 - Frontend hardcoded API URL fix (not started)

`frontend/src/helper-functions/serverCalls.js` hardcodes `http://localhost:3001` at
~24 call sites (confirmed via grep while working on step 1). Direct equivalent of
Segla's `REACT_APP_API_BASE_URL` fix - same shape:

- Add a `BASE_URL` constant read from `process.env.REACT_APP_API_BASE_URL`,
  replace all ~24 hardcoded occurrences.
- Remember this bakes in at Docker **build** time for a CRA app, not container
  start - changing it later means rebuilding the image, not just editing `.env` and
  restarting (Segla's guide §2 has the full explanation of why).
- `frontend/src/config.js` already holds `BGG_USERNAME` - consider whether
  `BASE_URL` belongs there too for consistency, or stays a plain env var like
  Segla's. Either is fine, just be deliberate about it.

## Step 5 - Port remapping (not started)

Already reserved in the homelab vault's `Software Stack.md` so Strata never
collides with Segla or Uptime Kuma: **4010 (frontend) / 4011 (backend)**, not
host-exposed (Caddy-only, same pattern as Segla). Currently 3000/3001 locally -
leave as-is for local dev until actually deploying; remap happens as part of the
deploy step, along with dropping `ports:` publishing entirely (Caddy reaches both
over the Docker network by container name, exactly like Segla §1/§8).

## Step 6 - Actual deployment to VM1 (not started)

Follow Segla's `SERVER_MIGRATION.md` section-by-section (§1 ports is already decided
above; §2 API URL is step 4 above) - the mechanics are identical:

- VM1 needs only `docker` + `docker compose` - nothing else.
- `git clone` to `/opt/strata-games` (per the charter's directory convention).
- Create `.env` on VM1 by hand (never arrives via git clone) - full table TBD once
  step 2's auth env vars exist.
- `pg_dump`/`pg_restore` the real collection data over - **do a test restore against
  a throwaway local Postgres container first**, same recommendation as Segla's
  guide, cheap insurance.
- Caddy integration: two hostnames needed (frontend + API), same split-subdomain
  pattern as Segla (`segla.keylimedesigns.dev` / `segla-api.keylimedesigns.dev`) -
  naming for Strata TBD, follow `Adding a New Service Behind Caddy.md`'s Pattern 1.
- DNS (public + local override on the GL.iNet router), ddclient entry, external
  verification from cellular data.
- `app.set("trust proxy", 1)` if auth's rate limiter needs the real client IP
  behind Caddy (same as Segla's `/auth/login` limiter).

## Step 7 - Cutover + cleanup (not started)

- Update `Software Stack.md`'s VM1 Port Map: 4010/4011 from "Planned" to "Active"
  with real hostnames.
- Decommission the laptop/WSL copy once the VM1 copy is confirmed solid - **don't
  run both simultaneously** against data restored from the same dump (they'll drift
  immediately, same warning as Segla's checklist).
- Revisit the open question from `Strata Games Migration.md`'s "Next Step": once
  both Segla and Strata are live on VM1, decide whether they stay standalone or get
  absorbed into a unified "Life Dashboard" (per `homelab_charter.md`).

## Things already known, don't re-derive

- BGG's XML API requires `Authorization: Bearer <token>` since 2025, and must be
  called at `boardgamegeek.com` (no `www` - it 301-redirects and some HTTP clients
  drop the Authorization header across that redirect). See `BACKEND_RESTRUCTURE.md`
  for the full investigation.
- BGG/Cloudflare can intermittently 403-challenge automated clients regardless of
  auth - not a blocker, just a known flake risk, documented in
  `BACKEND_RESTRUCTURE.md`.
- `frontend/src/` has pre-existing **uncommitted** work in progress (a Wishlist
  feature - modified `App.js`, `AppContext.js`, `Navbar.js`, `serverCalls.js`, plus
  new `components/Wishlist/` and styling files) as of 2026-10-01, unrelated to this
  migration. Don't discard or conflict with it - it's the user's own in-flight work.
- Migration files use sequential numeric prefixes (`001_create_my_games.js`, etc.),
  not Segla's timestamp convention - deliberately left alone (knex tracks applied
  migrations by filename; renaming risks breaking migration state for no benefit).
