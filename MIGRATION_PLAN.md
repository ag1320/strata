---
date: 2026-10-01
type: migration-plan
status: in-progress
tags: [strata-games, bgg-app, migration, vm1, roadmap]
---

# Strata Games (bgg-app) -> VM1 migration plan

**If you're a future Claude session picking this up cold: read this file first, then
`BACKEND_RESTRUCTURE.md` (step 1) and `AUTH.md` (step 2, also the auth system's own
setup doc) in this same repo root. The homelab Obsidian vault has the broader
context and the deployment-specific how-to:**

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
- [x] **Step 2 - Security audit + auth** (done 2026-10-01). Login (shared
      username/password, httpOnly JWT cookie), `sendError` everywhere a raw
      error object used to go straight to the client, CORS locked to an
      allowlist, `helmet`. Full writeup: **`AUTH.md`** (this repo root, setup
      instructions) - also documents a real bug found and fixed in the
      `hash-password` script's `$`-escaping (copied from Segla, silently a
      no-op - worth checking Segla's real deployed hash for the same issue).
      Verified end-to-end in a real browser against `docker compose up -d
      --build`: login, wrong-password rejection, every route 401ing without a
      session and 200ing with one, logout actually clearing the server-side
      session, and the in-progress Wishlist feature still rendering correctly
      post-login. Also fixed, as a side effect of testing the new Login page:
      three pre-existing unscoped global CSS leaks (`GroupAutocomplete.css`,
      `MyCollectionFilters.css`, `LogPlayModal.css` all had bare
      `.MuiInputLabel-root`/`.MuiFormLabel-root`/`.MuiOutlinedInput-input`
      selectors with no parent scoping, forcing every MUI text field on the
      page - including the new Login form - to render white-on-white).
- [x] **Wishlist feature fix + BGG Cloudflare root-cause fix** (done
      2026-10-01, not a numbered step - a detour while step 3 was being
      planned). The Wishlist feature itself was already fully built; three
      real bugs were found and fixed while verifying it: (1) the BGG
      `202`-retry loop (in both `getWishlist()` and the collection-sync path)
      had no backoff and silently swallowed real failures into an empty
      result, indistinguishable from a genuinely empty wishlist - fixed with
      a shared `pollBggEndpoint()` helper (backoff + attempt cap + throws on
      real failure) and a new `wishlistError` state surfaced in the UI;
      (2) the wishlist item mapper read `item.comment` but BGG's real XML tag
      is `<wishlistcomment>` - comments were silently always blank, fixed;
      (3) **the actual root cause of every Cloudflare 403 seen since step 1**
      turned out to be the spoofed Chrome `User-Agent` header in
      `bggController.js` - confirmed with a controlled A/B test from inside
      the container, fixed by removing it entirely. See `BACKEND_RESTRUCTURE.md`
      §3 for the full story. Verified live: real wishlist data (2 items,
      including a wishlist comment) renders correctly end-to-end.
- [ ] Step 3 - Docker production hardening
- [ ] Step 4 - Frontend hardcoded API URL fix
- [ ] Step 5 - Port remapping
- [ ] Step 6 - Actual deployment to VM1
- [ ] Step 7 - Cutover + cleanup

## Step 2 - Security audit + auth (done 2026-10-01 - see AUTH.md)

Done: login (shared username/password, httpOnly JWT cookie, `requireAuth` on
every route including BGG passthrough), `sendError` replacing every raw
`res.status(4xx).send(error)` across `backend/src/routes/*.js`, CORS switched
from wildcard to a `CORS_ORIGIN` allowlist, `helmet` added. Full setup/rotation
instructions: **`AUTH.md`** (this repo root).

Still true and worth carrying into later steps:

- **`.env` has a plaintext DB password** (`DB_PASSWORD`) already gitignored
  correctly - just carry it over securely (NordPass note or similar) when
  deploying, consider rotating it for the VM1 copy.
- Audit `.gitignore` for anything like a stray DB dump sitting in the repo
  (Segla had one slip through before this was caught) - clean as of 2026-10-01.
- If Strata ends up on a split frontend/API subdomain pattern like Segla
  (`strata.keylimedesigns.dev` / `strata-api.keylimedesigns.dev`, naming TBD),
  `helmet`'s `crossOriginResourcePolicy` is already set to `cross-origin` to
  support that - no further change needed when that happens.

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
- `app.set("trust proxy", 1)` already added in step 2 (needed so the login
  rate limiter sees the real client IP once Caddy is in front) - nothing to
  do here, just confirm it's still correct once Caddy's actually in place.

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
- BGG/Cloudflare 403-challenging automated clients - **root-caused and fixed**
  while finishing the Wishlist feature (2026-10-01): the spoofed Chrome
  `User-Agent` in `bggController.js` was the actual trigger, confirmed with a
  controlled A/B test. Fixed by just not sending a `User-Agent` at all. Full
  story in `BACKEND_RESTRUCTURE.md` §3. If this somehow resurfaces, don't
  re-add a fake browser UA as a "fix" - that's what caused it.
- `backend/Dockerfile` is still on `node:14-alpine` as of step 2 -
  `express-rate-limit@8.x` and `helmet@8.x` (added in step 2) both declare an
  `engines` requirement newer than Node 14 and print npm warnings on install,
  but both run fine at runtime in practice. Confirms step 3's Node version
  bump is about more than just OpenSSL/webpack - don't be surprised by more
  engine-mismatch warnings from future dependencies until that bump happens.
- Three pre-existing global CSS leaks were found and fixed while building
  step 2's Login page (unscoped `.MuiInputLabel-root`/`.MuiFormLabel-root`/
  `.MuiOutlinedInput-input` selectors in `GroupAutocomplete.css`,
  `MyCollectionFilters.css`, and `LogPlayModal.css` - each file had one
  properly-scoped version of these rules alongside a copy-pasted *unscoped*
  one, so CRA's global CSS bundling applied them to every MUI text field on
  every page, not just the modal each file was meant for). If a future
  component's MUI label/input text looks mysteriously invisible against a
  light background, check for this same pattern before assuming it's a new
  bug - `grep -rn 'MuiInputLabel\|MuiFormLabel\|MuiOutlinedInput' frontend/src/styling/*.css`
  and look for any hit with no parent class in front of it.
- `frontend/src/` has pre-existing **uncommitted** work in progress (a Wishlist
  feature - modified `App.js`, `AppContext.js`, `Navbar.js`, `serverCalls.js`, plus
  new `components/Wishlist/` and styling files) as of 2026-10-01, unrelated to this
  migration. Don't discard or conflict with it - it's the user's own in-flight work.
- Migration files use sequential numeric prefixes (`001_create_my_games.js`, etc.),
  not Segla's timestamp convention - deliberately left alone (knex tracks applied
  migrations by filename; renaming risks breaking migration state for no benefit).
