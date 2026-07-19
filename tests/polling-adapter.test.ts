import { describe, expect, it, vi } from "vitest";
import { PollingAdapter } from "../src/adapters/PollingAdapter";
import type { NotificationItem } from "../src/types";

const makeItem = (id: string): NotificationItem => ({
  id,
  title: `title-${id}`,
  message: "msg",
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
});

describe("PollingAdapter", () => {
  it("dedupes notifications across polls", async () => {
    vi.useFakeTimers();

    const fetcher = vi
      .fn<[number], Promise<NotificationItem[]>>()
      .mockResolvedValueOnce([makeItem("1")])
      .mockResolvedValue([makeItem("1"), makeItem("2")]);

    const adapter = new PollingAdapter({ fetcher, interval: 1000 });
    const received: NotificationItem[] = [];
    adapter.subscribe((item) => received.push(item));

    await adapter.connect();
    expect(received.map((r) => r.id)).toEqual(["1"]);

    await vi.advanceTimersByTimeAsync(1000);
    expect(received.map((r) => r.id)).toEqual(["1", "2"]);

    await adapter.disconnect();
    vi.useRealTimers();
  });
});
