import type { NotificationItem, RealtimeAdapter } from "../types";

export interface SSEAdapterOptions {
  url: string;
  eventName?: string;
  withCredentials?: boolean;
  parse?: (event: MessageEvent) => NotificationItem | null;
  eventSourceFactory?: (url: string, init?: EventSourceInit) => EventSource;
}

const defaultParse = (event: MessageEvent): NotificationItem | null => {
  try {
    return JSON.parse(event.data) as NotificationItem;
  } catch {
    return null;
  }
};

/**
 * Server-Sent Events realtime adapter. The browser auto-reconnects EventSource
 * connections, so this focuses on clean subscribe/parse semantics.
 */
export class SSEAdapter implements RealtimeAdapter {
  private source: EventSource | null = null;
  private listeners = new Set<(notification: NotificationItem) => void>();
  private connectionState: "connected" | "connecting" | "disconnected" = "disconnected";

  constructor(private readonly options: SSEAdapterOptions) {}

  async connect(): Promise<void> {
    if (typeof EventSource === "undefined" && !this.options.eventSourceFactory) {
      this.connectionState = "disconnected";
      throw new Error("EventSource is not available in this environment");
    }

    this.connectionState = "connecting";
    const factory =
      this.options.eventSourceFactory ??
      ((url: string, init?: EventSourceInit) => new EventSource(url, init));

    const source = factory(this.options.url, {
      withCredentials: this.options.withCredentials ?? false
    });
    this.source = source;

    source.onopen = () => {
      this.connectionState = "connected";
    };

    source.onerror = () => {
      this.connectionState = "connecting";
    };

    const handler = (event: MessageEvent) => {
      const parse = this.options.parse ?? defaultParse;
      const notification = parse(event);
      if (notification) {
        this.listeners.forEach((listener) => listener(notification));
      }
    };

    if (this.options.eventName) {
      source.addEventListener(this.options.eventName, handler as EventListener);
    } else {
      source.onmessage = handler;
    }
  }

  async disconnect(): Promise<void> {
    this.source?.close();
    this.source = null;
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
