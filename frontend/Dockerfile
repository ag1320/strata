# ---- Build stage ----
# Compiles the CRA app to static files, served below instead of running
# the dev server (webpack-dev-server) indefinitely - lighter/faster for an
# always-on deployment, and avoids the dev server's "Invalid Host header"
# rejection once this is reachable at a real domain instead of localhost.
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
# --legacy-peer-deps: package.json has a real, pre-existing peer-dependency
# mismatch (@mui/styles@5.16.0 wants react@^17, the app uses react@18.3.1) -
# npm 6 (bundled with the old node:14-alpine) silently tolerated this; npm
# 11+ (bundled with node:24-alpine) enforces peer deps strictly by default
# and refuses to install at all. This flag restores npm 6's old behavior
# rather than changing dependency resolution - confirmed this is the exact
# same mismatch already present and already working via `npm start` on the
# host today, not a new problem this Dockerfile introduces.
RUN npm install --legacy-peer-deps
COPY . .
# react-scripts 5's bundled webpack still hashes with MD4, which OpenSSL 3
# (default since Node 17) rejects - "error:0308010C:digital envelope
# routines::unsupported". Known issue, already hit and fixed this exact way
# for Segla's identical CRA setup after its own Node version bump. Only
# affects this build-stage RUN, not the runtime serve stage below.
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build

# ---- Serve stage ----
FROM node:24-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
