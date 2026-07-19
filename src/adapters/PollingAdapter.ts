import type { NotificationItem, RealtimeAdapter } from "../types";

export interface PollingAdapterOptions {
  /** Fetch the latest notifications. Return the full current list or new items. */
  fetcher: (since: number) => Promise<NotificationItem[]>;
  /** Poll interval in ms. */
  interval?: number;
  /** Deduplicate by id so already-seen notifications are not re-emitted. */
  dedupe?: boolean;
}

/**
 * Polling realtime adapter for backends without push/websocket support.
 * Emits only notifications newer than the last poll timestamp.
 */
export class PollingAdapter implements RealtimeAdapter {
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<(notification: NotificationItem) => void>();
  private seen = new Set<string>();
  private lastPolledAt = 0;
  private connectionState: "connected" | "connecting" | "disconnected" = "disconnected";

  constructor(private readonly options: PollingAdapterOptions) {}

  async connect(): Promise<void> {
    this.connectionState = "connecting";
    this.lastPolledAt = Date.now();
    await this.poll();
    this.connectionState = "connected";

    const interval = this.options.interval ?? 15_000;
    this.timer = setInterval(() => {
      void this.poll();
    }, interval);
  }

  private async poll(): Promise<void> {
    try {
      const items = await this.options.fetcher(this.lastPolledAt);
      this.lastPolledAt = Date.now();

      for (const item of items) {
        if (this.options.dedupe !== false) {
          if (this.seen.has(item.id)) continue;
          this.seen.add(item.id);
        }
        this.listeners.forEach((listener) => listener(item));
      }
    } catch {
      this.connectionState = "connecting";
    }
  }

  async disconnect(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.connectionState = "disconnected";
  }

  subscribe(listener: (notification: NotificationItem) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  status(): "connected" | "connecting" | "disconnected" {
    return this.connectionState;
  }
}
