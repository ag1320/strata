# Strata — Board Game Tracker

A full-stack board game collection and play-tracking application that integrates with the BoardGameGeek (BGG) API. Manage your collection, log play sessions, track player stats, and explore your gaming history — all from a locally hosted dashboard.

## Features

### Collection Management
- Import your BGG collection by username — games, metadata, and rich attributes sync automatically
- Browse your collection with detailed game cards showing BGG data (categories, mechanics, designers, publishers, player count, weight, etc.)
- Filter by category, mechanic, player count, weight, group membership, and more
- Mark favorites and set personal rankings
- Organize games into custom groups (e.g. "camping games", "2-player", "kids")

### Play Session Logging
- Log play sessions with game, date, duration, winner score, and notes
- Support for competitive, cooperative, and solo game types
- Add players per session — new players are created automatically and tracked over time
- Delete sessions with automatic cleanup of orphaned player records

### Player Stats & Leaderboards
- Per-player stat profiles: total plays, total wins, win percentage, most-played games, most recent games, highest win-percentage games
- Leaderboard view across all players
- Stats broken down by year and season
- Per-game stats: play history, win rates, score trends

### Home & Discovery
- Home dashboard with a carousel of trending/hot games pulled live from BGG
- Browse and explore BGG hot list without leaving the app

### BGG Integration
- Fetches collection, game details, friends, and hot games via the BGG XML API v2
- XML responses parsed server-side and served as JSON to the frontend
- Custom CORS proxy server handles BGG's cross-origin restrictions

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Material UI (MUI), React Query, Day.js |
| State Management | React Context API |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM / Migrations | Knex.js |
| External API | BoardGameGeek XML API v2 |
| XML Parsing | xml2js |
| Containerization | Docker, Docker Compose |

## Project Structure

```
strata/
├── frontend/               # React frontend
│   └── src/
│       ├── components/
│       │   ├── MyCollection/   # Collection, plays, players, groups, stats
│       │   ├── Friends/        # BGG friends integration
│       │   ├── Home.js         # Dashboard + hot games carousel
│       │   └── Navbar.js
│       ├── AppContext.js       # Global state via React Context
│       └── App.js
├── backend/                # Express backend
│   ├── app.js              # Route definitions
│   ├── controllers/        # Database queries and BGG API logic
│   └── migrations/         # Knex DB migrations
├── cors-server/            # Custom CORS proxy for BGG API
├── csv-data/               # Data exports
├── docker-compose.yaml
└── strata.sh               # One-command startup script
```

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)
- A BoardGameGeek account and API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ag1320/strata.git
cd strata
```

2. Create a `.env` file in the root directory:

```env
# Database
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=5432
DB_CONNECTION_STRING=postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}

# Environment
NODE_ENV=development

# BGG API
BGG_API_KEY=your_bgg_api_key
```

### Running the Application

```bash
bash strata.sh
```

The app will be available at `http://localhost:3000`. The backend runs on port `3001` and the CORS proxy on its own container.

## API Overview

| Domain | Endpoints |
|---|---|
| BGG — Hot Games | `GET /hot-games` |
| BGG — Game Details | `GET /specific-games` |
| BGG — User Collection | `GET /user-games` |
| BGG — Friends | `GET /friends` |
| Collection (DB) | `GET /db-my-games`, `POST /db-my-games`, `PATCH /db-my-games-rank`, `PATCH /db-my-games-favorite` |
| Groups | `GET/POST/PATCH/DELETE /db-groups` |
| Games ↔ Groups | `POST/DELETE /db-games-groups` |
| Players | `GET/POST/PATCH /db-players` |
| Play Sessions | `GET/POST/DELETE /session` |
