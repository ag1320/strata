# Auth setup

Strata Games now requires login. Same deliberate, minimal design Segla uses:
**one shared login, not per-person accounts** - no registration flow, no user
table, no password reset UI. The player/session data model already supports
multiple people logging plays; this login only gates *access to the app*, not
who's who inside it.

## How it works

- `POST /auth/login` checks `username`/`password` against `AUTH_USERNAME` and
  `AUTH_PASSWORD_HASH` (bcrypt) in `.env`, and on success sets an httpOnly,
  `Secure` (in production), `SameSite=Strict` cookie (`strata_session`)
  holding a signed JWT (7-day expiry).
- Every other API route requires that cookie
  (`backend/src/middleware/auth.js`). No cookie or an expired/invalid one ->
  `401` on every route, including the BGG passthrough routes (`/hot-games`,
  etc.) - no "this one's less sensitive" carve-outs.
- The frontend checks `/auth/me` on load (`RequireAuth`) and redirects to
  `/login` if that comes back `401`.
- `POST /auth/login` is rate-limited: 5 attempts per 15 minutes per IP.

httpOnly cookie + JWT rather than a JWT in `localStorage`: a cookie marked
httpOnly can't be read by JavaScript at all, so it isn't stealable via an XSS
bug in this app or any dependency.

## One-time setup

1. Pick a real username and a strong, unique password.
2. Generate the password hash:
   ```bash
   cd backend
   npm run hash-password
   # paste the password when prompted
   ```
3. Put the output in `.env` - **use the script's escaped output, not the raw
   hash it also prints for reference.** Docker Compose parses `.env` files
   and treats an unescaped `$name` as a variable reference to substitute -
   since bcrypt hashes are full of literal `$` characters
   (`$2b$12$restofhash...`), pasting the raw hash gets it silently truncated.
   ```
   AUTH_USERNAME=whatever-you-picked
   AUTH_PASSWORD_HASH=<the ESCAPED hash from step 2 - every $ doubled to $$>
   ```
   **Note on `hash-password`'s escaping:** the first version of this script
   (copied from Segla) had `hash.replaceAll("$", "$$")` to do this doubling,
   which looks right but is actually a silent no-op - `"$$"` as a
   *replacement string* in JS is itself special syntax meaning "insert one
   literal $", so that line produced the exact same (unescaped) string back
   out. Confirmed directly (`"a$b".replaceAll("$", "$$")` -> `"a$b"`,
   unchanged). Fixed here with a function replacer
   (`hash.replaceAll("$", () => "$$")`), which isn't subject to that
   special-pattern substitution. **Worth checking Segla's real
   `AUTH_PASSWORD_HASH` for the same issue** - if it was generated with the
   unfixed script, it may have the same silent-truncation problem.
4. Generate a `JWT_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   A fresh, unique value per environment - never reuse Segla's.
5. The server refuses to start if `AUTH_USERNAME`, `AUTH_PASSWORD_HASH`, or
   `JWT_SECRET` are unset - fails closed instead of silently running with no
   real auth configured.

## Rotating the password

Same as steps 1-2 above, then update `AUTH_PASSWORD_HASH` in `.env` and
restart the server. Existing sessions stay valid until their cookie expires
(7 days) or they log out. To force everyone out immediately, also rotate
`JWT_SECRET`.

## Current local-dev credential

Set while building this out: username `aaron`, password `strata-dev-2026`.
**Change this before this app is ever reachable outside your own machine** -
it's a placeholder, not a real credential.

## Deploying to VM1

See `MIGRATION_PLAN.md` step 6. VM1's `.env` needs its own `JWT_SECRET`
(never reuse this machine's), its own `AUTH_USERNAME`/`AUTH_PASSWORD_HASH`
(can be the same credential, your call), `CORS_ORIGIN` set to the real
Caddy-fronted frontend hostname once that's decided, and `NODE_ENV=production`
(controls the cookie's `Secure` flag).
