import { useEffect, useMemo, useState } from "react";
import {
  PollingAdapter,
  WebSocketAdapter,
  SSEAdapter,
  MemoryAdapter,
  type RealtimeAdapter,
  type NotificationData
} from "@zenithlogiclabs/react-notification-center";
import { createFullNotification, seedNotifications } from "../mockData";

/**
 * Minimal fake WebSocket that emits JSON notification payloads on a timer so the
 * real WebSocketAdapter can be demonstrated in-browser without a server.
 */
class FakeSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly emit: () => string, private readonly intervalMs: number) {
    setTimeout(() => {
      this.onopen?.();
      this.timer = setInterval(() => this.onmessage?.({ data: this.emit() }), this.intervalMs);
    }, 150);
  }

  send() {
    /* heartbeat disabled in this demo */
  }

  close() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.onclose?.();
  }
}

/** Minimal fake EventSource emitting JSON notification payloads on a timer. */
class FakeEventSource {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly emit: () => string, private readonly intervalMs: number) {
    setTimeout(() => {
      this.onopen?.();
      this.timer = setInterval(() => this.onmessage?.({ data: this.emit() }), this.intervalMs);
    }, 150);
  }

  addEventListener() {
    /* named events unused in this demo */
  }

  close() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

const emitPayload = (prefix: string) => () => JSON.stringify(createFullNotification(prefix));

function useAdapterDemo(factory: () => RealtimeAdapter) {
  const adapter = useMemo(factory, []);
  const [log, setLog] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = adapter.subscribe((item) => {
      setLog((prev) => [`${new Date().toLocaleTimeString()} — ${item.title}`, ...prev].slice(0, 6));
    });
    return () => {
      unsubscribe();
      void adapter.disconnect();
    };
  }, [adapter]);

  const connect = async () => {
    await adapter.connect();
    setConnected(true);
  };
  const disconnect = async () => {
    await adapter.disconnect();
    setConnected(false);
  };

  return { log, connected, connect, disconnect };
}

function AdapterCard({
  title,
  note,
  factory
}: {
  title: string;
  note: string;
  factory: () => RealtimeAdapter;
}) {
  const { log, connected, connect, disconnect } = useAdapterDemo(factory);

  return (
    <section className="panel gallery-card">
      <h3>{title}</h3>
      <p className="status">{note}</p>
      <div className="row">
        <button onClick={() => void connect()} disabled={connected}>
          Connect
        </button>
        <button onClick={() => void disconnect()} disabled={!connected}>
          Disconnect
        </button>
        <span className="status">
          Status: <strong className={connected ? "online" : "offline"}>{connected ? "connected" : "idle"}</strong>
        </span>
      </div>
      <ul className="log">
        {log.length === 0 ? <li className="status">No events yet — click Connect.</li> : null}
        {log.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ul>
    </section>
  );
}

function MemoryAdapterCard() {
  const adapter = useMemo(() => new MemoryAdapter(seedNotifications()), []);
  const [items, setItems] = useState<NotificationData[]>([]);

  const refresh = async () => setItems(await adapter.fetchNotifications());
  const send = async () => {
    await adapter.sendNotification?.(createFullNotification("mem"));
    await refresh();
  };

  return (
    <section className="panel gallery-card">
      <h3>MemoryAdapter</h3>
      <p className="status">In-memory NotificationAdapter (fetch / send / sync).</p>
      <div className="row">
        <button onClick={() => void refresh()}>Fetch</button>
        <button onClick={() => void send()}>Send new</button>
        <span className="status">{items.length} items loaded</span>
      </div>
      <ul className="log">
        {items.slice(0, 6).map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Demonstrates every built-in transport adapter running entirely in the browser
 * via injected fakes — no backend required.
 */
export function AdaptersPanel() {
  return (
    <div className="gallery">
      <AdapterCard
        title="PollingAdapter"
        note="Polls a fetcher every 4s and emits new items."
        factory={() =>
          new PollingAdapter({
            interval: 4000,
            dedupe: false,
            fetcher: async () => [createFullNotification("poll")]
          })
        }
      />

      <AdapterCard
        title="WebSocketAdapter"
        note="Native WebSocket adapter driven by an injected fake socket (emits every 5s)."
        factory={() =>
          new WebSocketAdapter({
            url: "wss://example.invalid/notifications",
            heartbeatInterval: 0,
            socketFactory: () => new FakeSocket(emitPayload("ws"), 5000) as unknown as WebSocket
          })
        }
      />

      <AdapterCard
        title="SSEAdapter"
        note="Server-Sent Events adapter driven by an injected fake EventSource (emits every 5s)."
        factory={() =>
          new SSEAdapter({
            url: "https://example.invalid/stream",
            eventSourceFactory: () => new FakeEventSource(emitPayload("sse"), 5000) as unknown as EventSource
          })
        }
      />

      <MemoryAdapterCard />
    </div>
  );
}
