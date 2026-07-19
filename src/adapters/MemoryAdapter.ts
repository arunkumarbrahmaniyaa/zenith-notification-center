import type { NotificationAdapter, NotificationItem } from "../types";

export class MemoryAdapter implements NotificationAdapter {
  private items: NotificationItem[];

  constructor(initial: NotificationItem[] = []) {
    this.items = initial;
  }

  async fetchNotifications(): Promise<NotificationItem[]> {
    return this.items;
  }

  async sendNotification(input: Partial<NotificationItem>): Promise<NotificationItem> {
    const item = {
      ...(input as NotificationItem)
    };
    this.items = [item, ...this.items];
    return item;
  }

  async markRead(id: string): Promise<void> {
    this.items = this.items.map((item) => (item.id === id ? { ...item, read: true } : item));
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }

  async archive(id: string): Promise<void> {
    this.items = this.items.map((item) => (item.id === id ? { ...item, archived: true } : item));
  }

  async sync(items: NotificationItem[]): Promise<void> {
    this.items = items;
  }
}
