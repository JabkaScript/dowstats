# DoW Stats

DoW Stats is a Nuxt 4 web application for browsing player statistics and leaderboards for Warhammer 40,000: Dawn of War. It integrates Relic Community API data with the DoW Stats database, providing clean tables, player profile cards, and analytical views.

## Features

- View leaderboards and player statistics (Relic Leaderboards)
- Player profiles with avatar, per-format stats (1v1–4v4), and recent matches
- Integration with DoW Stats API (local endpoints `/api/v1/**`)
- Internationalization (i18n) and dark mode support (Color Mode)

## Installation & Run (Bun)

### Requirements

- Node.js ≥ 18
- Bun ≥ 1.1 (https://bun.sh)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/JabkaScript/dowstats.git
   cd dowstats
   ```
2. Install dependencies (Bun):
   ```bash
   bun install
   ```
3. Copy environment file and configure DB/proxy if needed:
   ```bash
   cp .env.example .env
   # edit .env as needed
   ```
4. Start development server (Bun):
   ```bash
   bun run dev
   # open http://localhost:3000
   ```
5. Build and preview (Bun):
   ```bash
   bun run build
   bun run preview
   ```

## Usage Examples

- Home: `http://localhost:3000/`
- Relic Ladder: `http://localhost:3000/relic-ladder`
- Player Profile: `http://localhost:3000/player/<steamId>`
- Relic API documentation (local): `relic-api` page

Local API examples:

- Get DoW Stats for a player: `GET /api/v1/players/{id}`
- Get server list: `GET /api/v1/servers`

## License

MIT License. See `LICENSE` file.

## Author Contact

- Repository: https://github.com/JabkaScript/dowstats
- Issues: https://github.com/JabkaScript/dowstats/issues