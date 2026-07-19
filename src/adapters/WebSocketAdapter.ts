import type { NotificationItem, RealtimeAdapter } from "../types";

export interface WebSocketAdapterOptions {
  url: string;
  protocols?: string | string[];
  /** Parse an incoming message into a notification. Return null to ignore. */
  parse?: (event: MessageEvent) => NotificationItem | null;
  /** Base delay used for exponential backoff reconnection (ms). */
  reconnectBaseDelay?: number;
  /** Maximum reconnection delay (ms). */
  reconnectMaxDelay?: number;
  /** Heartbeat interval (ms). Set to 0 to disable. */
  heartbeatInterval?: number;
  /** Payload sent on each heartbeat tick. */
  heartbeatMessage?: string;
  /** Provide a custom WebSocket implementation (e.g. for SSR/testing). */
  socketFactory?: (url: string, protocols?: string | string[]) => WebSocket;
}

const defaultParse = (event: MessageEvent): NotificationItem | null => {
  try {
    return JSON.parse(event.data) as NotificationItem;
  } catch {
    return null;
  }
};

/**
 * Native WebSocket realtime adapter with heartbeat and exponential backoff.
 * No external dependencies. Works with any server that emits notification JSON.
 */
export class WebSocketAdapter implements RealtimeAdapter {
  private socket: WebSocket | null = null;
  private listeners = new Set<(notification: NotificationItem) => void>();
  private connectionState: "connected" | "connecting" | "disconnected" = "disconnected";
  private reconnectAttempts = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private manualClose = false;

  constructor(private readonly options: WebSocketAdapterOptions) {}

  async connect(): Promise<void> {
    this.manualClose = false;
    await this.open();
  }

  private open(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof WebSocket === "undefined" && !this.options.socketFactory) {
        this.connectionState = "disconnected";
        reject(new Error("WebSocket is not available in this environment"));
        return;
      }

      this.connectionState = "connecting";
      const factory =
        this.options.socketFactory ??
        ((url: string, protocols?: string | string[]) => new WebSocket(url, protocols));

      const socket = factory(this.options.url, this.options.protocols);
      this.socket = socket;

      socket.onopen = () => {
        this.connectionState = "connected";
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        resolve();
      };

      socket.onmessage = (event) => {
        const parse = this.options.parse ?? defaultParse;
        const notification = parse(event);
        if (notification) {
          this.listeners.forEach((listener) => listener(notification));
        }
      };

      socket.onclose = () => {
        this.connectionState = "disconnected";
        this.stopHeartbeat();
        if (!this.manualClose) {
          this.scheduleReconnect();
        }
      };

      socket.onerror = () => {
        if (this.connectionState === "connecting") {
          reject(new Error("WebSocket connection failed"));
        }
      };
    });
  }

  private scheduleReconnect(): void {
    const base = this.options.reconnectBaseDelay ?? 1000;
    const max = this.options.reconnectMaxDelay ?? 30_000;
    const delay = Math.min(base * 2 ** this.reconnectAttempts, max);
    this.reconnectAttempts += 1;

    this.reconnectTimer = setTimeout(() => {
      void this.open().catch(() => this.scheduleReconnect());
    }, delay);
  }

  private startHeartbeat(): void {
    const interval = this.options.heartbeatInterval ?? 30_000;
    if (interval <= 0) return;

    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(this.options.heartbeatMessage ?? "ping");
      }
    }, interval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  async disconnect(): Promise<void> {
    this.manualClose = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
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
