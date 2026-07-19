zenith-react-notification-center

Enterprise-grade React notification ecosystem inspired by Microsoft Teams, Slack, GitHub, Discord, and Firebase Notifications.

This package is more than a toast library. It provides:

- Toast notifications
- Notification center / inbox
- Real-time notification ingestion adapters
- Browser push notification hooks
- Read/unread state and actions
- Grouping, filtering, sorting, and searching
- Offline queue and sync helpers
- TypeScript-first APIs
- Headless + UI components
- Theme and styling system

## Why This Library

- Built for product teams shipping complex apps, not demos.
- Composable primitives: use full UI, headless APIs, or mixed mode.
- Adapter-based architecture for backend and realtime providers.
- Accessible defaults (ARIA labels, keyboard-first interactions, reduced motion support).
- Lightweight runtime with tree-shakable exports.

## Tech Stack

- React 19
- TypeScript
- Vite
- Rollup
- Vitest + React Testing Library
- Storybook

## Installation

```bash
npm install @zenithlogiclabs/react-notification-center
```

```bash
yarn add @zenithlogiclabs/react-notification-center
```

```bash
pnpm add @zenithlogiclabs/react-notification-center
```

## Quick Start

```tsx
import {
	NotificationProvider,
	NotificationCenter,
	ToastContainer,
	useNotificationActions
} from "@zenithlogiclabs/react-notification-center";

function DemoActions() {
	const { addNotification } = useNotificationActions();

	return (
		<button
			onClick={() =>
				addNotification({
					title: "Deployment complete",
					message: "All services are healthy.",
					category: "devops",
					type: "success",
					priority: "high"
				})
			}
		>
			Push Notification
		</button>
	);
}

export function App() {
	return (
		<NotificationProvider>
			<NotificationCenter />
			<ToastContainer position="top-right" />
			<DemoActions />
		</NotificationProvider>
	);
}
```

## Architecture

```text
src/
	adapters/
	components/
		Toast/
		Inbox/
		NotificationItem/
		NotificationList/
		Badge/
		Bell/
		Search/
		Filters/
		EmptyState/
		Loading/
		Modal/
		Drawer/
		Popover/
	hooks/
	providers/
	services/
	utils/
	types/
	constants/
	themes/
	icons/
	styles/
```

## Notification Data Model

Notification payload supports rich fields including:

- id, title, message, description
- icon, image, avatar
- timestamp, createdAt, updatedAt
- type, category, priority, status
- read, archived, starred, pinned
- actionUrl, buttons
- metadata, tags, sender, groupId
- expiresAt, progress, attachments
- sound, vibration, deliveryStatus
- isOffline, retryCount, customData

Core type exports are available as:

- `NotificationData`
- `NotificationGroupData`
- `NotificationProviderProps`
- `NotificationContextValue`

## Notification Types

- success, error, warning, info
- primary, secondary, system
- chat, mention, reminder
- calendar, meeting, task
- upload, download, security
- approval, marketing, announcement
- custom

## Priority Levels

- critical
- high
- medium
- low
- silent

## Core Components

- `<NotificationProvider>`
- `<NotificationBell>`
- `<NotificationCenter>`
- `<NotificationDrawer>`
- `<NotificationPopover>`
- `<NotificationSidebar>`
- `<NotificationInbox>`
- `<ToastContainer>`
- `<NotificationBadge>`
- `<NotificationList>`
- `<NotificationItem>`
- `<NotificationSearch>`
- `<NotificationFilters>`
- `<NotificationGroup>`
- `<NotificationSettings>`

## Hooks

- `useNotifications()`
- `useToast()`
- `useUnreadCount()`
- `useNotificationCenter()`
- `useRealtime()`
- `usePush()`
- `usePermission()`
- `useOfflineQueue()`
- `useNotificationActions()`
- `usePushSubscription()`
- `useVirtualizer()`

## Provider API

`NotificationProvider` context exposes:

- `notifications`
- `add(input)`
- `remove(id)`
- `update(id, patch)`
- `archive(id)`
- `pin(id, pinned?)`
- `star(id, starred?)`
- `markRead(id)`
- `markUnread(id)`
- `markAllRead()`
- `clear()`
- `search(query)`
- `filter(filterState)`
- `group(groupBy)`
- `sort(sortBy)`
- `sync()`
- `subscribe(listener)` / `unsubscribe(listener)`
- `toast.show(options)`
- `toast.dismiss(id)`
- `toast.dismissAll()`
- `toast.promise(promise, options)`

## Headless + UI Mode

Components are split for flexibility:

- `NotificationItemHeadless`
- `NotificationListHeadless`
- `NotificationSearchHeadless`
- `NotificationFiltersHeadless`
- `NotificationBellHeadless`
- `NotificationInboxHeadless`

Use headless variants to completely own rendering while reusing behavior.

## Adapters

### Notification Adapter

Create custom adapters using this contract:

```ts
interface NotificationAdapter {
	fetchNotifications: () => Promise<NotificationData[]>;
	sendNotification?: (input: Partial<NotificationData>) => Promise<NotificationData>;
	markRead?: (id: string) => Promise<void>;
	delete?: (id: string) => Promise<void>;
	archive?: (id: string) => Promise<void>;
	sync?: (items: NotificationData[]) => Promise<void>;
}
```

Built-in adapters:

- `MemoryAdapter` — in-memory store for demos/tests
- `RestAdapter` — REST backend (`fetchNotifications`, `sendNotification`, `markRead`, `delete`, `archive`, `sync`)

```tsx
import { NotificationProvider, RestAdapter } from "@zenithlogiclabs/react-notification-center";

const adapter = new RestAdapter({
  baseUrl: "https://api.example.com",
  headers: () => ({ Authorization: `Bearer ${getToken()}` })
});

<NotificationProvider adapter={adapter}>{children}</NotificationProvider>;
```

### Realtime Adapters

All realtime adapters implement the `RealtimeAdapter` contract and plug into the
`realtime` prop of `NotificationProvider`.

```ts
interface RealtimeAdapter {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  subscribe: (listener: (notification: NotificationData) => void) => () => void;
  status?: () => "connected" | "connecting" | "disconnected";
}
```

Built-in realtime adapters:

- `WebSocketAdapter` — native WebSocket with heartbeat + exponential backoff reconnect
- `SSEAdapter` — Server-Sent Events
- `PollingAdapter` — interval polling with dedupe
- `FirebaseAdapter` — injected Firestore wrapper (no hard dependency)
- `SupabaseAdapter` — injected Supabase realtime channel (no hard dependency)

```tsx
import { NotificationProvider, WebSocketAdapter } from "@zenithlogiclabs/react-notification-center";

const realtime = new WebSocketAdapter({
  url: "wss://realtime.example.com/notifications",
  heartbeatInterval: 30000,
  reconnectBaseDelay: 1000,
  reconnectMaxDelay: 30000
});

<NotificationProvider realtime={realtime}>{children}</NotificationProvider>;
```

Firebase and Supabase adapters accept an injected client so those SDKs stay
optional and are never bundled unless you use them:

```tsx
import { FirebaseAdapter, SupabaseAdapter } from "@zenithlogiclabs/react-notification-center";

const firebase = new FirebaseAdapter({
  client: {
    onNotification: (handler) => onSnapshot(query, (snap) => {
      snap.docChanges().forEach((change) => handler(change.doc.data()));
    })
  }
});

const supabase = new SupabaseAdapter({
  channel: supabaseClient.channel("notifications")
});
```

## Virtualization

Render very large inboxes (100k+ notifications) with windowed rendering:

```tsx
import { VirtualizedNotificationList, useNotifications } from "@zenithlogiclabs/react-notification-center";

function BigInbox() {
  const { notifications, markRead } = useNotifications();
  return (
    <VirtualizedNotificationList
      items={notifications}
      height={480}
      itemHeight={116}
      onRead={markRead}
    />
  );
}
```

The underlying `useVirtualizer()` hook is exported for building custom windowed UIs.

## Browser Push + Service Worker

1. Copy the shipped service worker to your app root (served at `/znc-sw.js`).
   It is published with the package and importable at
   `@zenithlogiclabs/react-notification-center/service-worker`.
2. Subscribe from a component with `usePushSubscription()`:

```tsx
import { usePushSubscription } from "@zenithlogiclabs/react-notification-center";

function PushToggle() {
  const { supported, permission, subscription, subscribe, unsubscribe } = usePushSubscription();

  if (!supported) return <p>Push is not supported in this browser.</p>;

  return subscription ? (
    <button onClick={() => unsubscribe()}>Disable push</button>
  ) : (
    <button
      onClick={() =>
        subscribe({
          vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
          serviceWorkerPath: "/znc-sw.js"
        })
      }
    >
      Enable push (permission: {permission})
    </button>
  );
}
```

The service worker handles `push`, `notificationclick`, and `notificationclose`
events, forwards clicks to the focused client via `postMessage`, and honors
`priority: "critical"` (requireInteraction) and `priority: "silent"`.

## Offline Queue + Sync

Offline mode includes:

- action queue in local storage
- automatic replay on reconnect
- sync-friendly action records
- persistent cache via `StorageService`

## Theming and Styling

- CSS variable driven theme model
- `enterpriseTheme` built in
- `mergeTheme(...)` helper for runtime overrides
- mobile-first responsive layout
- reduced-motion support

Import styles:

```tsx
import "@zenithlogiclabs/react-notification-center/styles.css";
```

## Accessibility

- ARIA labels on controls
- semantic regions for inbox and list
- polite live regions for dynamic content
- keyboard-friendly buttons and interactions
- reduced motion media support

## Storybook

```bash
npm run storybook
```

Stories included:

- Notification center
- Toast container playground
- Virtualized list (100k items)

## Testing

```bash
npm run test
```

Includes:

- utility unit tests
- provider integration tests

## Build

```bash
npm run build
```

Outputs:

- ESM (`dist/index.js`)
- CJS (`dist/index.cjs`)
- type declarations (`dist/*.d.ts`)
- CSS bundle (`dist/style.css`)

## SSR Compatibility

The library avoids direct browser access during import time.
Browser APIs are guarded at runtime, making it safe for SSR frameworks like Next.js and Remix.

## Example Scenarios

- Chat application mentions and unread tracking
- CRM approval workflow alerts
- ERP task center
- Admin dashboard incident feed
- E-commerce order and refund notifications

## Roadmap

- Virtualized inbox for 100k+ notifications
- Notification rules and templates
- i18n and timezone presets
- push service worker orchestration helpers
- plugin SDK for transport and analytics extensions

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run storybook`
- `npm run build-storybook`

## License

MIT
