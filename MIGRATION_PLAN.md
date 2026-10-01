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
- [x] **Step 3 - Docker production hardening** (done 2026-10-01). Both
      Dockerfiles are now two-stage, non-root, on `node:24-alpine` (matching
      Segla); `backend/package.json` splits `start` (plain `node`, no
      nodemon) from a new `dev` (nodemon, for host-side live-reload); both
      `.dockerignore` files added; `docker-compose.yaml` drops both bind
      mounts and adds `restart: unless-stopped` to all three services. Ports
      unchanged (3000/3001, no Caddy yet). **Real issue found and fixed**:
      `frontend`'s `npm install` failed outright on the newer npm bundled
      with `node:24-alpine` - `@mui/styles@5.16.0` declares a peer dependency
      on `react@^17`, but the app uses `react@18.3.1`. This mismatch already
      existed and was already silently tolerated by npm 6 (bundled with the
      old `node:14-alpine`); npm 11+ enforces peer deps strictly by default
      and refuses to install. Fixed with `--legacy-peer-deps` in the
      Dockerfile (restores the old tolerant behavior, doesn't change what
      actually gets resolved) rather than touching the dependency itself -
      worth a real fix in its own pass someday, but out of scope here.
      Verified end-to-end against the hardened containers: login, real
      collection data (141 games), Wishlist (real items + comment), and
      logout all work identically to before; confirmed the accepted
      live-reload trade-off is real (`docker inspect` shows zero mounts on
      either container now).
- [x] **Step 4 - Frontend hardcoded API URL fix** (done 2026-10-01). All 27
      hardcoded `http://localhost:3001` occurrences in `serverCalls.js`
      (slightly more than the ~24 originally estimated) replaced with a
      `BASE_URL` constant read from `REACT_APP_API_BASE_URL`. Wired as a
      Dockerfile `ARG`/`ENV` and a `docker-compose.yaml` build arg, matching
      Segla's `ui/Dockerfile` pattern exactly. Verified the compiled bundle
      actually has the right value baked in (`docker exec frontend grep` on
      the built JS), not just that the code looks right.
- [x] **Step 5 - Port remapping** (done 2026-10-01). Frontend 3000->4010,
      backend 3001->4011, matching the reservation already made in the
      homelab's `Software Stack.md`. Touched: `app.js`'s `PORT` env var
      (was hardcoded), both Dockerfiles' `EXPOSE`, `docker-compose.yaml`'s
      `ports:`, `CORS_ORIGIN`/`REACT_APP_API_BASE_URL` in `.env`, and two
      stale references caught along the way (`strata.sh`'s browser-open
      command, `README.md`'s outdated port/CORS-proxy mention). Verified
      end-to-end on the new ports via both curl and a full browser pass -
      login, 141 real collection games, Wishlist, and logout all confirmed
      working on :4010/:4011, not just "the containers started."
- [~] **Step 6 - Actual deployment to VM1 (in progress)**. The in-repo
      Caddy-prep half is done (2026-10-01): hostnames decided
      (`strata.keylimedesigns.dev` / `strata-api.keylimedesigns.dev`), both
      app containers no longer publish host ports, `.env` points at the real
      hostnames, and a real container-naming collision with Segla's
      `frontend` container was caught and fixed (renamed to
      `strata-frontend`) before it could become a live routing bug. **Local
      `localhost:4010`/`:4011` access is now gone, deliberately.** What's
      left all lives on VM1 itself (git clone, `.env` creation, DB restore,
      Caddy/DNS/ddclient) and needs either Aaron running it directly or a
      way for Claude to reach that machine - see the full breakdown in the
      Step 6 section below.
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

## Step 3 - Docker production hardening (done 2026-10-01)

Done: both Dockerfiles are two-stage (deps/build + runtime/serve) on
`node:24-alpine`, `backend` runs as non-root `node`, `backend/package.json`
splits `start` (plain `node`) from a new `dev` (nodemon, for host-side
live-reload now that the bind mount is gone), both `.dockerignore` files
added, `docker-compose.yaml` has `restart: unless-stopped` on all three
services and no bind mounts on `backend`/`frontend` anymore.

Notable: the OpenSSL-3/webpack MD4 incompatibility Segla hit
(`error:0308010C:digital envelope routines::unsupported`) was headed off
preemptively with `ENV NODE_OPTIONS=--openssl-legacy-provider` on the
frontend build stage, copying Segla's already-known fix rather than
rediscovering it - the build succeeded clean, so this wasn't re-verified by
removing the flag to see if it would actually have failed without it; treat
that line as load-bearing. What **wasn't** anticipated and had to be fixed
for real: `frontend`'s `npm install` failed outright under npm 11+ (bundled
with `node:24-alpine`) over a pre-existing `@mui/styles@5.16.0` (wants
`react@^17`) vs. `react@18.3.1` peer-dependency mismatch that npm 6 (bundled
with the old `node:14-alpine`) silently tolerated. Fixed with
`--legacy-peer-deps` in the Dockerfile rather than touching the dependency
itself - that mismatch is still there, just not installed. A real fix (bump
or drop `@mui/styles`, check what the app actually still uses it for) worth
investigating in its own pass, not before deployment.

## Step 4 - Frontend hardcoded API URL fix (done 2026-10-01)

Done as described in Status above. `frontend/src/config.js`'s `BGG_USERNAME`
was left where it is - `BASE_URL` stayed a plain module-level constant in
`serverCalls.js` instead, matching Segla's own pattern exactly rather than
inventing a new convention.

## Step 5 - Port remapping (done 2026-10-01)

Done as described in Status above - frontend/backend now run on 4010/4011
everywhere (Dockerfiles, compose, `.env`, `app.js`). **One deliberate
deviation from this section's original plan:** ports are still host-published
(`ports:` still present in `docker-compose.yaml` for both services) - the
original note here said "not host-exposed (Caddy-only)," but that part is
Caddy's job, not this step's. Caddy doesn't exist yet; removing host
publishing now would just break local dev with no way to reach the app at
all. Dropping `ports:` entirely happens in step 6, once Caddy is actually
proxying both containers by name over the Docker network (Segla §1/§8).

## Step 6 - Actual deployment to VM1 (not started)

Follow Segla's `SERVER_MIGRATION.md` section-by-section (§1 ports is already decided
above; §2 API URL is step 4 above) - the mechanics are identical:

### Caddy prep - DONE in this repo (2026-10-01)

Hostnames decided: **`strata.keylimedesigns.dev`** (frontend) /
**`strata-api.keylimedesigns.dev`** (API) - same domain and naming
convention as Segla, just the `strata` prefix instead of `segla`.

`docker-compose.yaml` and `.env` updated to match:
- `backend` and `strata-frontend` (see naming note below) no longer publish
  `ports:` at all - reachable only over the Docker network, Caddy-only
  access, matching Segla's exact pattern. `database` also dropped its host
  port for the same reason (not strictly Caddy-related, but the same
  "don't expose what doesn't need it" principle, and free to do at the same
  time). **This breaks `localhost:4010`/`:4011` access from this machine -
  deliberate, confirmed with the user before doing it.**
- `.env`: `CORS_ORIGIN=https://strata.keylimedesigns.dev`,
  `REACT_APP_API_BASE_URL=https://strata-api.keylimedesigns.dev`,
  `NODE_ENV=production` (this machine's copy of the repo has no reachable
  localhost left either way, so there's no reason to keep it at
  `development` here anymore).
- **Real catch made before it became a live bug:** Segla's frontend
  container is *also* named literally `frontend` (its backend is `server`,
  so no collision there). Once Caddy's own `docker-compose.yml` on VM1 joins
  *both* apps' Docker networks, two different containers both resolvable as
  plain `frontend` is a genuine ambiguous-DNS risk - Compose registers the
  DNS alias from the **service name** (the YAML key), not just
  `container_name`, so the fix had to rename the service itself. Renamed
  bgg-app's frontend service (and `container_name`) to **`strata-frontend`**.
  `backend` keeps its name - no collision there. Verified post-rename:
  `strata-frontend` can still reach `backend:4011` by name over the Docker
  network, confirming internal routing (the same mechanism Caddy itself will
  use) still works.
- Verified: compiled frontend bundle has `strata-api.keylimedesigns.dev`
  baked in correctly; all three containers come up clean with no published
  ports (`docker compose ps` shows no `0.0.0.0:X->Y` mappings).

### Still needed - the parts that live on VM1 itself, not in this repo

I (Claude) don't have access to VM1 from this session - no SSH, no
filesystem access, nothing. Everything below has to be run by Aaron
directly on that machine, or Claude needs to be given a way to reach it.

- VM1 needs only `docker` + `docker compose` - nothing else.
- `git clone` to `/opt/strata-games` (per the charter's directory
  convention) - this makes the Compose project name `strata-games`, so the
  Docker network becomes **`strata-games_network1`** (auto-prefixed from the
  directory name, same mechanism Segla's `segla_network1` came from).
- Create `.env` on VM1 by hand (never arrives via `git clone` - it's
  gitignored) - `.env.example` (this repo root) has the complete list of
  every var needed. **Generate fresh `AUTH_PASSWORD_HASH` and `JWT_SECRET`
  directly on VM1 (or any machine with Node) - do not copy this machine's
  values.** The `CORS_ORIGIN`/`REACT_APP_API_BASE_URL`/hostnames are already
  the real production ones in this repo's `.env.example` - just copy those
  two lines as-is.
- `pg_dump`/`pg_restore` the real collection data over - **do a test restore
  against a throwaway local Postgres container first**, cheap insurance.
- **Join Caddy to Strata's network** - in `/opt/caddy/docker-compose.yml`:
  ```yaml
  services:
    caddy:
      networks:
        - nextcloud_default        # existing
        - segla_network1           # existing
        - strata-games_network1    # add this
        - caddy_net

  networks:
    strata-games_network1:
      external: true
  ```
- **Caddyfile blocks** - append to `/opt/caddy/Caddyfile`:
  ```
  strata.keylimedesigns.dev {
      reverse_proxy strata-frontend:4010
      log {
          output file /var/log/caddy/strata.access.log
          format json
      }
  }

  strata-api.keylimedesigns.dev {
      reverse_proxy backend:4011
      log {
          output file /var/log/caddy/strata-api.access.log
          format json
      }
  }
  ```
  Add these **only once Strata is actually deployed and running** - same
  warning as Segla's guide, a block pointing at a container that doesn't
  exist yet is a live door with none of this app's protections the moment
  something with that name does start. Reload after adding:
  `cd /opt/caddy && sudo docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile`.
- **DNS** - public A records for `strata` and `strata-api` (same public IP
  as everything else), plus the local override on the GL.iNet Flint 2 (LuCI:
  Network -> DHCP and DNS -> Resolv and Hosts Files -> **Addresses**):
  ```
  /strata.keylimedesigns.dev/<VM1's LAN IP>
  /strata-api.keylimedesigns.dev/<VM1's LAN IP>
  ```
  Verify with `dig @10.0.0.1 strata.keylimedesigns.dev` (and `-api`).
- **ddclient** - add both hostnames to the existing comma-separated host
  list in `/etc/ddclient.conf` (same Porkbun block Segla uses, don't create
  a second one), then verify in the foreground:
  `sudo ddclient -daemon=0 -verbose -noquiet`.
- `app.set("trust proxy", 1)` already added in step 2 (needed so the login
  rate limiter sees the real client IP once Caddy is in front) - nothing to
  do here, just confirm it's still correct once Caddy's actually in place.
- **External verification** from cellular data, off home WiFi:
  `curl -I https://strata.keylimedesigns.dev` and
  `curl -I https://strata-api.keylimedesigns.dev` - valid cert, no warnings.

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
