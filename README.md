# Urbex-Project-FRONT

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Environment (.env)

Copy the example and configure your API base URL:

```sh
cp .env.example .env
```

Then edit `.env` and set:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Notes:

- The frontend reads `VITE_API_BASE_URL` (no trailing slash). If absent, it falls back to the default value embedded in `src/services/api.js`.
- Auth token is stored under `localStorage.tokenUser`.

Housekeeping:

- Avoid keeping duplicate folders that differ only by case (e.g. `LeaderBoard/` vs `leaderboard/`). Canonical path used by the router is `src/components/leaderboard/`.

## Routes overview

Named routes used across the app (kebab-case):

- home → `/`
- login → `/login`
- register → `/register`
- scenarios-list → `/scenario`
- scenario-detail → `/scenario/:id`
- explore-map → `/explore-map` (legacy: `/global-map` redirects)
- game-map → `/game-map` (legacy: `/current-map` redirects)
- leaderboard → `/leaderboard` with children:
  - leaderboard-global → `/leaderboard`
  - leaderboard-weeks → `/leaderboard/weeks`
  - leaderboard-friends → `/leaderboard/friends`
- user → `/user-profile`

Protected routes have `meta.requiresAuth`. The guard redirects to `login` with a `redirect` query.

## API modules

All API access is centralized under `src/services`:

- `http.js`
  - `BASE_URL`: resolved from `VITE_API_BASE_URL`.
  - `apiFetch(path, { method, body, auth, headers, raw })`: fetch wrapper with JSON handling and automatic `401` broadcast via `window.dispatchEvent('api:unauthorized')`.
- `auth.api.js` → `AuthAPI`
  - `login({ email, password })`, `register(payload)`, `me()`, `player()`, `updatePlayer(payload)`.
- `scenarios.api.js` → `ScenariosAPI`, `MissionsAPI`
  - Scenarios: `getMine()`, `getProgress(id)`, `getFull(id)`, `bookmark(id)`, `unbookmark(id)`, `listScenarioCommunes({ published })`.
  - Missions: `complete({ missionId, answer })`.
- `communes.api.js` → `CommunesAPI`
  - `list()`, `get(id)`, `shape(id)`, `shapesAll()`,
  - `shapesFeatureCollection()` returns a GeoJSON FeatureCollection for bulk rendering.
- `api.js` is a barrel that re-exports `BASE_URL`, `AuthAPI`, `ScenariosAPI`, `MissionsAPI`, `CommunesAPI`.

## State and naming conventions

- Components/views: PascalCase filenames (e.g. `ExploreMapView.vue`, `ScenarioInfoView.vue`).
- Routes: kebab-case names (see above).
- Variables/functions: camelCase.
- Constants: UPPER_SNAKE_CASE.
- Scenario list items (Pinia store `scenarios`):
  - `id`, `title`, `status` (`not_started` | `started` | `completed`), `bookmarked` (boolean),
  - `startedAt`, `completedAt` (camelCase in frontend, mapped from API fields),
  - `progressRatio` (0..1). After enrichment: `completedMissions`, `totalMissions`, `hasPreciseProgress`.

## Maps quick notes

- Global map in `src/views/ExploreMapView.vue` renders commune polygons and clustered scenario markers.
- `publishedOnly` toggle reloads markers via `ScenariosAPI.listScenarioCommunes({ published })`.
- Drawer shows `ScenarioCard`s; selecting navigates to `scenario-detail` while preserving map state in query.

## Auth and 401 handling

- Presence of `localStorage.tokenUser` indicates authenticated state.
- On `401` responses, a `window` event `api:unauthorized` is emitted; listeners can trigger logout and redirect.
