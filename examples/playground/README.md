# Zenith Notification Center — Playground

A full-feature runnable example demonstrating every capability of
`@zenithlogiclabs/react-notification-center`:

- Toasts (success/warning/persistent/promise) with switchable positions
- Notification inbox + drawer + animated bell + unread badge
- Realtime ingestion via a mock `RealtimeAdapter` (emits every ~9s)
- Search, filters, sorting, and grouping
- Virtualized list rendering 100,000 notifications
- Browser push subscription workflow (service worker + VAPID)
- Offline queue (toggle your network to observe queued actions)
- Light/dark theming via CSS variables
- Analytics event hooks (logged to the console)

## Run

> **Requires Node.js 18 or newer** (Vite 6 uses `node:fs/promises` APIs that are
> unavailable on Node 16).

From the repository root, build/install the library once, then run the example.
The example aliases the package name to the library source, so no publish step
is required.

```bash
# in repo root
npm install

# in this folder
cd examples/playground
npm install
npm run dev
```

Open http://localhost:5173.

## Push notifications

Replace the placeholder `vapidPublicKey` in `src/App.tsx` with your own VAPID
public key and ensure `public/znc-sw.js` is served at the site root.
