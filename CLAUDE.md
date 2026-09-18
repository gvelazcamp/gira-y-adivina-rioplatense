# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

"Girá y Adiviná Rioplatense" is a Río de la Plata–themed wheel-of-fortune / word-guessing trivia game. It is a **single-file vanilla HTML/CSS/JS app**: almost all game logic, styles, and markup live in `index.html` (thousands of lines, inline `<style>` and `<script>`). There is no build tooling, no bundler, no package.json, no framework, and no test suite.

The game is deployed two ways from the same code:
- **Web / PWA**: served as a static site via GitHub Pages at `https://gvelazcamp.github.io/gira-y-adivina-rioplatense/` (URL recorded in the `Repo` file). `manifest.json` makes it installable (`start_url: "./index.html"`, standalone, portrait, `lang: "es-UY"`).
- **Android**: wrapped as a TWA (Trusted Web Activity) — `.well-known/assetlinks.json` declares the Android package `io.github.gvelazcamp.twa`. Because the TWA just loads the live web app, **most gameplay/content changes ship instantly to Android users on next launch with no new APK build.**

## Commands

There is no build, lint, or test step. To preview locally, serve the directory as static files, e.g.:

```
python3 -m http.server
```

then open `index.html` in a browser. Verify UI changes manually (or with Playwright) in a real browser — there is no automated test suite to run.

## Service worker (`sw.js`)

Split strategy, not uniformly network-first anymore:
- `index.html`/JS/manifest: **network-first**, falling back to cache only when offline. This was a conscious fix for a real bug — a cache-first strategy left phones (especially the TWA) stuck on stale versions after deploys.
- Anything under `assets/`: **cache-first** (added later to stop the shop re-fetching every icon over the network on each open).

Because images are cache-first, **replacing the content of an existing file under `assets/` (same filename, different picture) will not reach phones that already cached it** unless `CACHE_NAME` is bumped — bump it whenever you overwrite an existing asset's bytes, not just when the app-shell file list changes.

## Architecture inside `index.html`

### State model: `S` vs `V`
- `S` is the host's authoritative, mutable game state.
- `V` is a render-facing snapshot broadcast to all clients, produced by `publicar()`.
- `pintar()` / `pintarTodo()` render from `V`, never directly from `S`, so guests and the host render identically.

### Mode dispatch: `modo`
Game behavior branches throughout the code on a `modo` string:
- `"local"` — same-device, no network.
- `"bot"` — vs AI (covers both world-map matches and the "Jugar online" fake matchmaking flow).
- `"host"` / `"guest"` — real multiplayer with a friend.
- `"tvhost"` / `"tvguest"` — "Sala TV" family mode.

Anything involving per-player display (e.g. which tablero/board background to show) needs to check `modo` and handle each branch — `aplicarTableroSegunTurno()` is the reference example: `"host"/"guest"` swap board art per `V.jug[V.turno].tab` (turn-based), while `"bot"/"local"` always show the local player's own `tableroEquipado` (no swapping, since there's no real opponent turn to reflect).

### Multiplayer transport
Real-time sync uses **public MQTT brokers over WebSocket** (e.g. `wss://broker.emqx.io:8084/mqtt`) — there is no custom backend/server. Treat message payloads over MQTT as the only channel between host and guest(s).

### Shop (`Tienda`)
CSS/JS use a `tn-` prefix convention. Purchases go through a generic pipeline dispatched by string-prefix on an item "tipo": `tnPuedeComprar(tipo)` → `tnRazonBloqueo(tipo)` → `tnEjecutarCompra(tipo, precio)`. Known tipo prefixes: `sobre_<cityId>` (collectible pack), `marco_<frameId>` (avatar frame), `oferta_gratis`, `vida`, `recarga`, `ruleta`. A shared confirmation modal (`#confirmCompra`) is reused for all purchase types; `#capaSeccionTienda` is a shared full-screen sub-modal used to show a section's full catalog when its title is tapped (pattern: a few items shown inline, the rest only visible via this "ver todos" view).

`ruleta` (Giro extra) is special-cased: it does not purchase directly — it shows a confirm dialog and, on confirm, navigates to the Ruleta screen instead.

Real-money purchases (`.tn-comprar-mini`, `.tn-item.tn-real`, and the "Paquetes con dinero real" section) are fully built in the UI but currently **hidden via a single CSS block** (search for "PAUSA DE DINERO REAL") pending Google Play Billing integration — not deleted, just hidden, meant to be reactivated later. The real-money buttons that are reachable are stubbed to show a "coming soon" toast; there is no real payment integration yet.

Ownership state for shop items (`tablerosComprados`, `framesComprados`, equipped selections) is tracked in in-memory Sets/strings and persisted to `localStorage`; always check ownership via the existing `*Poseido`/`*Disponibles` helpers rather than assuming an item is free.

### Daily rotation
`ofertaDiaIdx()` derives a deterministic index from `Math.floor(Date.now()/86400000)` (days since epoch) — this drives which items appear in "Ofertas diarias" (daily frame deal, daily collectible pack) without needing localStorage or server coordination; every client computes the same day index independently.

### Collections
`COLECCIONES` is keyed by city id (e.g. `montevideo`, `punta`, `colonia`, etc.) and defines each city's collectible-pack art and item list; `Object.keys(COLECCIONES)` is the canonical ordered list of city ids used both by the shop grid and the daily pack rotation.

### Persistence
Game/profile/shop state persists via `localStorage` under `gya_`-prefixed keys (e.g. `gya_tablero_equipado`). Player identity is a simple typed-in profile name (`perfil.nombre`), not an auth system — do not assume it's unique or stable across devices.

### Asset pipeline
Images under `assets/` (avatars, frames, tableros, per-city collectibles, shop art) are generated externally (ChatGPT image prompts) then processed locally with Python/PIL (resize/crop, convert to `.webp`) before being committed. The board-art generation prompt template is kept at `assets/tableros/PROMPT.md` for regenerating that specific style.
