import type { NotificationAdapter, NotificationItem } from "../types";

export interface RestAdapterOptions {
  baseUrl: string;
  /** Optional headers factory (e.g. auth tokens). */
  headers?: () => Record<string, string> | Promise<Record<string, string>>;
  /** Custom fetch implementation (SSR/testing). Defaults to global fetch. */
  fetchImpl?: typeof fetch;
  routes?: {
    list?: string;
    create?: string;
    markRead?: (id: string) => string;
    remove?: (id: string) => string;
    archive?: (id: string) => string;
    sync?: string;
  };
}

/**
 * REST notification adapter implementing the NotificationAdapter contract.
 * Configure endpoints via `routes`; sensible RESTful defaults are provided.
 */
export class RestAdapter implements NotificationAdapter {
  constructor(private readonly options: RestAdapterOptions) {}

  private get fetchImpl(): typeof fetch {
    const impl = this.options.fetchImpl ?? (typeof fetch !== "undefined" ? fetch : undefined);
    if (!impl) {
      throw new Error("No fetch implementation available. Provide options.fetchImpl.");
    }
    return impl;
  }

  private async buildHeaders(): Promise<Record<string, string>> {
    const custom = this.options.headers ? await this.options.headers() : {};
    return { "Content-Type": "application/json", ...custom };
  }

  private url(path: string): string {
    return `${this.options.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  }

  async fetchNotifications(): Promise<NotificationItem[]> {
    const route = this.options.routes?.list ?? "notifications";
    const response = await this.fetchImpl(this.url(route), {
      method: "GET",
      headers: await this.buildHeaders()
    });
    if (!response.ok) throw new Error(`Failed to fetch notifications: ${response.status}`);
    return (await response.json()) as NotificationItem[];
  }

  async sendNotification(input: Partial<NotificationItem>): Promise<NotificationItem> {
    const route = this.options.routes?.create ?? "notifications";
    const response = await this.fetchImpl(this.url(route), {
      method: "POST",
      headers: await this.buildHeaders(),
      body: JSON.stringify(input)
    });
    if (!response.ok) throw new Error(`Failed to create notification: ${response.status}`);
    return (await response.json()) as NotificationItem;
  }

  async markRead(id: string): Promise<void> {
    const route = this.options.routes?.markRead?.(id) ?? `notifications/${id}/read`;
    const response = await this.fetchImpl(this.url(route), {
      method: "PATCH",
      headers: await this.buildHeaders()
    });
    if (!response.ok) throw new Error(`Failed to mark read: ${response.status}`);
  }

  async delete(id: string): Promise<void> {
    const route = this.options.routes?.remove?.(id) ?? `notifications/${id}`;
    const response = await this.fetchImpl(this.url(route), {
      method: "DELETE",
      headers: await this.buildHeaders()
    });
    if (!response.ok) throw new Error(`Failed to delete: ${response.status}`);
  }

  async archive(id: string): Promise<void> {
    const route = this.options.routes?.archive?.(id) ?? `notifications/${id}/archive`;
    const response = await this.fetchImpl(this.url(route), {
      method: "PATCH",
      headers: await this.buildHeaders()
    });
    if (!response.ok) throw new Error(`Failed to archive: ${response.status}`);
  }

  async sync(items: NotificationItem[]): Promise<void> {
    const route = this.options.routes?.sync ?? "notifications/sync";
    const response = await this.fetchImpl(this.url(route), {
      method: "POST",
      headers: await this.buildHeaders(),
      body: JSON.stringify({ items })
    });
    if (!response.ok) throw new Error(`Failed to sync: ${response.status}`);
  }
}
