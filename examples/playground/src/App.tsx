import { useMemo, useState } from "react";
import {
  NotificationProvider,
  NotificationBell,
  NotificationBadge,
  NotificationInbox,
  NotificationDrawerPanel,
  ToastContainer,
  VirtualizedNotificationList,
  NotificationGroup,
  useNotifications,
  useToast,
  useNotificationActions,
  useUnreadCount,
  useOfflineQueue,
  usePushSubscription,
  enterpriseTheme,
  type NotificationAnalyticsEvents,
  type NotificationData,
  type NotificationSort,
  type NotificationGroupBy,
  type NotificationTheme,
  type ToastPosition
} from "@zenithlogiclabs/react-notification-center";
import { MockRealtimeAdapter, createRandomNotification, seedNotifications } from "./mockData";
import { ComponentsGallery } from "./panels/ComponentsGallery";
import { HooksPanel } from "./panels/HooksPanel";
import { AdaptersPanel } from "./panels/AdaptersPanel";

type ToastUIPosition = Exclude<ToastPosition, "custom">;

type TabKey = "dashboard" | "components" | "hooks" | "adapters";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "components", label: "Components" },
  { key: "hooks", label: "Hooks" },
  { key: "adapters", label: "Adapters" }
];

const darkTheme: Partial<NotificationTheme> = {
  mode: "dark",
  colors: {
    ...enterpriseTheme.colors,
    background: "#0f172a",
    surface: "#1e293b",
    text: "#e2e8f0",
    mutedText: "#94a3b8",
    border: "#334155",
    primary: "#60a5fa",
    badge: "#f87171"
  }
};

const toastPositions: ToastUIPosition[] = [
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
  "top-center",
  "bottom-center"
];

const sortOptions: NotificationSort[] = [
  "newest",
  "oldest",
  "priority",
  "unread-first",
  "alphabetical",
  "sender",
  "category"
];

const groupOptions: NotificationGroupBy[] = ["none", "date", "category", "priority", "sender"];

const analytics: NotificationAnalyticsEvents = {
  onNotificationReceived: (item) => console.log("[analytics] received", item.title),
  onNotificationRead: (item) => console.log("[analytics] read", item.title),
  onNotificationDeleted: (item) => console.log("[analytics] deleted", item.title),
  onToastShown: (item) => console.log("[analytics] toast shown", item.title),
  onOffline: () => console.log("[analytics] went offline"),
  onOnline: () => console.log("[analytics] back online")
};

const generateMany = (count: number): NotificationData[] =>
  Array.from({ length: count }, (_, index) => {
    const partial = createRandomNotification();
    const timestamp = Date.now() - index * 60_000;
    return {
      id: `big-${index}`,
      title: `${partial.title} #${index + 1}`,
      message: partial.message!,
      timestamp,
      createdAt: new Date(timestamp).toISOString(),
      updatedAt: new Date(timestamp).toISOString(),
      type: partial.type!,
      category: partial.category!,
      priority: partial.priority!,
      status: "new",
      read: index % 3 === 0,
      archived: false,
      starred: false,
      pinned: false,
      sender: partial.sender,
      tags: partial.tags
    } satisfies NotificationData;
  });

function Toolbar() {
  const { addNotification, markAllRead, clear } = useNotificationActions();
  const { toast } = useToast();
  const { isOnline } = useOfflineQueue();

  const addRandom = () => addNotification(createRandomNotification());

  const runPromiseToast = () => {
    const work = new Promise<string>((resolve, reject) => {
      setTimeout(() => (Math.random() > 0.3 ? resolve("Report ready") : reject(new Error("Failed"))), 1800);
    });
    void toast.promise(work, {
      loading: { title: "Generating report…" },
      success: (value) => ({ title: "Done", message: value, type: "success" }),
      error: () => ({ title: "Something went wrong", type: "error" })
    });
  };

  return (
    <section className="panel">
      <h2>Actions</h2>
      <div className="row">
        <button onClick={addRandom}>Add notification</button>
        <button onClick={() => addNotification({ ...createRandomNotification(), priority: "critical", type: "security" })}>
          Add critical
        </button>
        <button onClick={markAllRead}>Mark all read</button>
        <button onClick={clear}>Clear all</button>
      </div>
      <h3>Toasts</h3>
      <div className="row">
        <button onClick={() => toast.show({ title: "Saved", message: "Your changes were saved", type: "success" })}>
          Success toast
        </button>
        <button onClick={() => toast.show({ title: "Heads up", message: "Storage almost full", type: "warning" })}>
          Warning toast
        </button>
        <button onClick={() => toast.show({ title: "Persistent", message: "Stays until dismissed", persistent: true })}>
          Persistent toast
        </button>
        <button onClick={runPromiseToast}>Promise toast</button>
      </div>
      <p className="status">
        Connection: <strong className={isOnline ? "online" : "offline"}>{isOnline ? "online" : "offline"}</strong>{" "}
        (toggle your browser network to see the offline queue in action)
      </p>
    </section>
  );
}

function Controls() {
  const { search, searchQuery, filter, filters, sort, sortBy, group, groupBy } = useNotifications();

  return (
    <section className="panel">
      <h2>Search, Filter, Sort & Group</h2>
      <div className="row">
        <input
          type="search"
          placeholder="Search notifications…"
          value={searchQuery}
          onChange={(event) => search(event.target.value)}
        />
      </div>
      <div className="row">
        <button className={filters.unread ? "active" : ""} onClick={() => filter({ unread: true })}>
          Unread only
        </button>
        <button className={filters.starred ? "active" : ""} onClick={() => filter({ starred: true })}>
          Starred
        </button>
        <button className={filters.priority === "critical" ? "active" : ""} onClick={() => filter({ priority: "critical" })}>
          Critical
        </button>
        <button onClick={() => filter({})}>Reset filters</button>
      </div>
      <div className="row">
        <label>
          Sort
          <select value={String(sortBy)} onChange={(event) => sort(event.target.value as NotificationSort)}>
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Group
          <select
            value={typeof groupBy === "string" ? groupBy : "custom"}
            onChange={(event) => group(event.target.value as NotificationGroupBy)}
          >
            {groupOptions.map((option) => (
              <option key={String(option)} value={String(option)}>
                {String(option)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

function GroupedFeed() {
  const { groups, groupBy } = useNotifications();

  if (groupBy === "none") {
    return null;
  }

  return (
    <section className="panel">
      <h2>Grouped feed</h2>
      <div className="stack">
        {groups.map((group) => (
          <NotificationGroup key={group.id} group={group} />
        ))}
      </div>
    </section>
  );
}

function PushPanel() {
  const { supported, permission, subscription, subscribe, unsubscribe } = usePushSubscription();

  return (
    <section className="panel">
      <h2>Browser Push</h2>
      {!supported ? (
        <p>Push notifications are not supported in this browser context.</p>
      ) : (
        <div className="row">
          <span className="status">Permission: {permission}</span>
          {subscription ? (
            <button onClick={() => void unsubscribe()}>Unsubscribe</button>
          ) : (
            <button
              onClick={() =>
                void subscribe({
                  // Replace with your real VAPID public key.
                  vapidPublicKey: "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8",
                  serviceWorkerPath: "/znc-sw.js"
                })
              }
            >
              Enable push
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function BigListPanel() {
  const [items, setItems] = useState<NotificationData[]>([]);
  const { markRead } = useNotificationActions();

  return (
    <section className="panel">
      <h2>Virtualized list (100k)</h2>
      <div className="row">
        <button onClick={() => setItems(generateMany(100_000))}>Generate 100,000</button>
        <button onClick={() => setItems([])}>Clear</button>
        <span className="status">{items.length.toLocaleString()} items</span>
      </div>
      {items.length > 0 ? (
        <VirtualizedNotificationList items={items} height={420} itemHeight={116} onRead={markRead} />
      ) : (
        <p className="status">Generate a large dataset to see windowed rendering.</p>
      )}
    </section>
  );
}

function Header({
  onOpenInbox,
  themeMode,
  onToggleTheme
}: {
  onOpenInbox: () => void;
  themeMode: "light" | "dark";
  onToggleTheme: () => void;
}) {
  const unread = useUnreadCount();

  return (
    <header className="app-header">
      <div className="brand">
        <span className="logo">🔔</span>
        <div>
          <h1>Zenith Notification Center</h1>
          <p>Full-feature playground</p>
        </div>
      </div>
      <div className="header-actions">
        <button onClick={onToggleTheme}>{themeMode === "light" ? "🌙 Dark" : "☀️ Light"}</button>
        <span className="badge-wrap">
          Unread <NotificationBadge count={unread} />
        </span>
        <NotificationBell unreadCount={unread} onClick={onOpenInbox} />
      </div>
    </header>
  );
}

function Dashboard({
  themeMode,
  onToggleTheme,
  toastPosition,
  onToastPositionChange
}: {
  themeMode: "light" | "dark";
  onToggleTheme: () => void;
  toastPosition: ToastUIPosition;
  onToastPositionChange: (position: ToastUIPosition) => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("dashboard");

  return (
    <div className="app">
      <Header onOpenInbox={() => setDrawerOpen(true)} themeMode={themeMode} onToggleTheme={onToggleTheme} />

      <nav className="tabs" aria-label="Sections">
        {tabs.map((item) => (
          <button
            key={item.key}
            className={tab === item.key ? "active" : ""}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "dashboard" ? (
        <main className="grid">
          <div className="column">
            <Toolbar />
            <Controls />
            <section className="panel">
              <h2>Toast position</h2>
              <div className="row">
                {toastPositions.map((position) => (
                  <button
                    key={position}
                    className={toastPosition === position ? "active" : ""}
                    onClick={() => onToastPositionChange(position)}
                  >
                    {position}
                  </button>
                ))}
              </div>
            </section>
            <PushPanel />
            <BigListPanel />
          </div>

          <div className="column">
            <section className="panel inbox-panel">
              <h2>Inbox</h2>
              <NotificationInbox />
            </section>
          <GroupedFeed />
        </div>
      </main>
      ) : null}

      {tab === "components" ? (
        <main className="tab-body">
          <ComponentsGallery />
        </main>
      ) : null}

      {tab === "hooks" ? (
        <main className="tab-body">
          <HooksPanel />
        </main>
      ) : null}

      {tab === "adapters" ? (
        <main className="tab-body">
          <AdaptersPanel />
        </main>
      ) : null}

      <NotificationDrawerPanel open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <NotificationInbox />
      </NotificationDrawerPanel>

      <ToastContainer position={toastPosition} />
    </div>
  );
}

export function App() {
  const realtime = useMemo(() => new MockRealtimeAdapter(9000), []);
  const initial = useMemo(() => seedNotifications(), []);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [toastPosition, setToastPosition] = useState<ToastUIPosition>("top-right");

  return (
    <NotificationProvider
      initialNotifications={initial}
      realtime={realtime}
      analytics={analytics}
      theme={themeMode === "dark" ? darkTheme : enterpriseTheme}
    >
      <div className={themeMode === "dark" ? "theme-dark" : "theme-light"}>
        <Dashboard
          themeMode={themeMode}
          onToggleTheme={() => setThemeMode((mode) => (mode === "light" ? "dark" : "light"))}
          toastPosition={toastPosition}
          onToastPositionChange={setToastPosition}
        />
      </div>
    </NotificationProvider>
  );
}
