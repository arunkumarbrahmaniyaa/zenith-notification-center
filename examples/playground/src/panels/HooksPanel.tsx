import { useState } from "react";
import {
  useInbox,
  usePush,
  usePermission,
  useRealtime,
  useNotificationCenter,
  useVirtualizer
} from "@zenithlogiclabs/react-notification-center";

function VirtualizerDemo() {
  const rowCount = 5000;
  const { virtualItems, totalHeight, scrollRef } = useVirtualizer({
    count: rowCount,
    estimateItemHeight: 30,
    overscan: 6
  });

  return (
    <div ref={scrollRef} className="vlist" style={{ height: 200, overflow: "auto" }}>
      <div style={{ height: totalHeight, position: "relative" }}>
        {virtualItems.map((row) => (
          <div
            key={row.index}
            className="vrow"
            style={{ position: "absolute", top: row.start, height: row.size, left: 0, right: 0 }}
          >
            Row #{row.index + 1} of {rowCount.toLocaleString()}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Demonstrates the remaining hooks not shown on the Dashboard tab:
 * useInbox, usePush, usePermission, useRealtime, useNotificationCenter, useVirtualizer.
 */
export function HooksPanel() {
  const inbox = useInbox();
  const push = usePush();
  const permission = usePermission();
  const realtime = useRealtime();
  const center = useNotificationCenter();
  const [lastRequest, setLastRequest] = useState<string>("—");

  return (
    <div className="gallery">
      <section className="panel gallery-card">
        <h3>useInbox</h3>
        <p className="status">Segmented inbox counts.</p>
        <ul className="kv">
          <li>Total: <strong>{inbox.total}</strong></li>
          <li>Unread: <strong>{inbox.unread.length}</strong></li>
          <li>Read: <strong>{inbox.read.length}</strong></li>
        </ul>
      </section>

      <section className="panel gallery-card">
        <h3>useNotificationCenter</h3>
        <p className="status">Alias of useInbox — same aggregate API.</p>
        <ul className="kv">
          <li>Total: <strong>{center.total}</strong></li>
          <li>Unread: <strong>{center.unread.length}</strong></li>
        </ul>
      </section>

      <section className="panel gallery-card">
        <h3>usePush</h3>
        <p className="status">Notification permission + request().</p>
        <div className="row">
          <span className="status">Permission: <strong>{push.permission}</strong></span>
          <button
            onClick={async () => {
              const result = await push.request();
              setLastRequest(result);
            }}
          >
            Request permission
          </button>
        </div>
        <p className="status">Last result: {lastRequest}</p>
      </section>

      <section className="panel gallery-card">
        <h3>usePermission</h3>
        <p className="status">Alias of usePush.</p>
        <span className="status">Permission: <strong>{permission.permission}</strong></span>
      </section>

      <section className="panel gallery-card">
        <h3>useRealtime</h3>
        <p className="status">Connection state + manual sync().</p>
        <div className="row">
          <span className="status">
            Online: <strong className={realtime.isOnline ? "online" : "offline"}>{String(realtime.isOnline)}</strong>
          </span>
          <button onClick={() => void realtime.sync()}>Trigger sync</button>
        </div>
      </section>

      <section className="panel gallery-card">
        <h3>useVirtualizer</h3>
        <p className="status">Raw windowing hook rendering 5,000 rows.</p>
        <VirtualizerDemo />
      </section>
    </div>
  );
}
