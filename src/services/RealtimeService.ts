import type { NotificationItem, RealtimeAdapter } from "../types";

export class RealtimeService {
  private unsubscribeFn: (() => void) | null = null;

  constructor(private readonly adapter?: RealtimeAdapter) {}

  async connect(listener: (item: NotificationItem) => void): Promise<void> {
    if (!this.adapter) return;
    await this.adapter.connect();
    this.unsubscribeFn = this.adapter.subscribe(listener);
  }

  async disconnect(): Promise<void> {
    this.unsubscribeFn?.();
    this.unsubscribeFn = null;

    if (!this.adapter) return;
    await this.adapter.disconnect();
  }

  status(): "connected" | "connecting" | "disconnected" {
    return this.adapter?.status?.() ?? "disconnected";
  }
}
