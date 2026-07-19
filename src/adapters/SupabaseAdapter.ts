import type { NotificationItem, RealtimeAdapter } from "../types";

/**
 * Structural type for a Supabase realtime channel. Keeps `@supabase/supabase-js`
 * an injected dependency rather than a hard peer dependency.
 */
export interface SupabaseChannelLike {
  on: (
    event: "postgres_changes",
    filter: Record<string, unknown>,
    callback: (payload: { new: NotificationItem }) => void
  ) => SupabaseChannelLike;
  subscribe: (callback?: (status: string) => void) => SupabaseChannelLike;
  unsubscribe: () => Promise<"ok" | "timed out" | "error">;
}

export interface SupabaseAdapterOptions {
  channel: SupabaseChannelLike;
  filter?: Record<string, unknown>;
}

/**
 * Supabase realtime adapter using postgres_changes. Provide a configured
 * channel from `supabase.channel(...)`.
 */
export class SupabaseAdapter implements RealtimeAdapter {
  private listeners = new Set<(notification: NotificationItem) => void>();
  private connectionState: "connected" | "connecting" | "disconnected" = "disconnected";

  constructor(private readonly options: SupabaseAdapterOptions) {}

  async connect(): Promise<void> {
    this.connectionState = "connecting";
    const filter = this.options.filter ?? {
      event: "INSERT",
      schema: "public",
      table: "notifications"
    };

    this.options.channel
      .on("postgres_changes", filter, (payload) => {
        this.listeners.forEach((listener) => listener(payload.new));
      })
      .subscribe((status) => {
        this.connectionState = status === "SUBSCRIBED" ? "connected" : "connecting";
      });
  }

  async disconnect(): Promise<void> {
    await this.options.channel.unsubscribe();
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
