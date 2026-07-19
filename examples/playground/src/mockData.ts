import type {
  NotificationData,
  NotificationType,
  RealtimeAdapter
} from "@zenithlogiclabs/react-notification-center";

const senders = [
  { id: "u1", name: "Ava Chen", avatar: "" },
  { id: "u2", name: "Marcus Lee", avatar: "" },
  { id: "u3", name: "Release Bot", avatar: "" },
  { id: "u4", name: "Security", avatar: "" }
];

const templates: Array<{ type: NotificationType; title: string; message: string; category: string }> = [
  { type: "mention", title: "You were mentioned", message: "mentioned you in #engineering", category: "chat" },
  { type: "success", title: "Deploy succeeded", message: "Production release v2.4.1 is live", category: "devops" },
  { type: "task", title: "Task assigned", message: "Review the onboarding flow", category: "tasks" },
  { type: "approval", title: "Approval needed", message: "Expense report #4821 awaits approval", category: "finance" },
  { type: "security", title: "New sign-in", message: "New login from San Francisco", category: "security" },
  { type: "meeting", title: "Meeting in 10 min", message: "Design sync starts soon", category: "calendar" }
];

let counter = 0;

export const createRandomNotification = (): Partial<NotificationData> => {
  const template = templates[counter % templates.length]!;
  const sender = senders[counter % senders.length]!;
  counter += 1;

  return {
    title: template.title,
    message: `${sender.name} ${template.message}`,
    type: template.type,
    category: template.category,
    priority: counter % 5 === 0 ? "critical" : counter % 3 === 0 ? "high" : "medium",
    sender,
    tags: [template.category, template.type],
    metadata: { application: template.category }
  };
};

/** Build a complete NotificationData item (all required fields) from a template. */
export const createFullNotification = (idPrefix = "gen"): NotificationData => {
  const partial = createRandomNotification();
  const timestamp = Date.now();
  return {
    id: `${idPrefix}-${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
    title: partial.title!,
    message: partial.message!,
    timestamp,
    createdAt: new Date(timestamp).toISOString(),
    updatedAt: new Date(timestamp).toISOString(),
    type: partial.type!,
    category: partial.category!,
    priority: partial.priority!,
    status: "new",
    read: false,
    archived: false,
    starred: false,
    pinned: false,
    sender: partial.sender,
    tags: partial.tags,
    metadata: partial.metadata
  } satisfies NotificationData;
};

export const seedNotifications = (): NotificationData[] => {
  return Array.from({ length: 8 }, (_, index) => {
    const partial = createRandomNotification();
    const timestamp = Date.now() - index * 45 * 60 * 1000;
    return {
      id: `seed-${index}`,
      title: partial.title!,
      message: partial.message!,
      timestamp,
      createdAt: new Date(timestamp).toISOString(),
      updatedAt: new Date(timestamp).toISOString(),
      type: partial.type!,
      category: partial.category!,
      priority: partial.priority!,
      status: "new",
      read: index > 4,
      archived: false,
      starred: index === 1,
      pinned: index === 0,
      sender: partial.sender,
      tags: partial.tags,
      metadata: partial.metadata
    } satisfies NotificationData;
  });
};

/**
 * Mock realtime adapter that emits a random notification every few seconds
 * while connected. Demonstrates the RealtimeAdapter contract end to end.
 */
export class MockRealtimeAdapter implements RealtimeAdapter {
  private listeners = new Set<(item: NotificationData) => void>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private state: "connected" | "connecting" | "disconnected" = "disconnected";

  constructor(private readonly intervalMs = 9000) {}

  async connect(): Promise<void> {
    this.state = "connected";
    this.timer = setInterval(() => {
      const partial = createRandomNotification();
      const timestamp = Date.now();
      this.listeners.forEach((listener) =>
        listener({
          id: `rt-${timestamp}-${Math.random().toString(36).slice(2, 7)}`,
          title: partial.title!,
          message: partial.message!,
          timestamp,
          createdAt: new Date(timestamp).toISOString(),
          updatedAt: new Date(timestamp).toISOString(),
          type: partial.type!,
          category: partial.category!,
          priority: partial.priority!,
          status: "new",
          read: false,
          archived: false,
          starred: false,
          pinned: false,
          sender: partial.sender,
          tags: partial.tags,
          metadata: partial.metadata
        })
      );
    }, this.intervalMs);
  }

  async disconnect(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.state = "disconnected";
  }

  subscribe(listener: (item: NotificationData) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  status(): "connected" | "connecting" | "disconnected" {
    return this.state;
  }
}
