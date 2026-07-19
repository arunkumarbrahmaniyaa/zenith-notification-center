import { describe, expect, it, vi } from "vitest";
import { WebSocketAdapter } from "../src/adapters/WebSocketAdapter";
import type { NotificationItem } from "../src/types";

class FakeSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readyState = 1;
  sent: string[] = [];

  constructor(public url: string) {
    setTimeout(() => this.onopen?.(), 0);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.readyState = 3;
    this.onclose?.();
  }

  emit(item: NotificationItem) {
    this.onmessage?.({ data: JSON.stringify(item) } as MessageEvent);
  }
}

describe("WebSocketAdapter", () => {
  it("emits parsed notifications to subscribers", async () => {
    let socketRef: FakeSocket | null = null;
    const adapter = new WebSocketAdapter({
      url: "wss://example.test",
      heartbeatInterval: 0,
      socketFactory: (url) => {
        socketRef = new FakeSocket(url) as unknown as FakeSocket;
        return socketRef as unknown as WebSocket;
      }
    });

    const received: NotificationItem[] = [];
    adapter.subscribe((item) => received.push(item));

    await adapter.connect();
    expect(adapter.status()).toBe("connected");

    const sample = {
      id: "1",
      title: "hello",
      message: "world",
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: "info",
      category: "general",
      priority: "medium",
      status: "new",
      read: false,
      archived: false,
      starred: false,
      pinned: false
    } as NotificationItem;

    socketRef!.emit(sample);
    expect(received).toHaveLength(1);
    expect(received[0]?.title).toBe("hello");

    await adapter.disconnect();
    expect(adapter.status()).toBe("disconnected");
  });
});
