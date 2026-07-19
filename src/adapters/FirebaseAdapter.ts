import type { NotificationItem, RealtimeAdapter } from "../types";

/**
 * Minimal structural type describing the Firestore surface this adapter needs.
 * Passing the real Firestore instance keeps `firebase` an optional, injected
 * dependency instead of a hard peer dependency of this package.
 */
export interface FirestoreLike {
  onNotification: (
    handler: (item: NotificationItem) => void
  ) => () => void;
}

export interface FirebaseAdapterOptions {
  client: FirestoreLike;
}

/**
 * Firebase realtime adapter. Provide a small client wrapper exposing
 * `onNotification` (typically built on Firestore `onSnapshot`).
 */
export class FirebaseAdapter implements RealtimeAdapter {
  private unsubscribeSnapshot: (() => void) | null = null;
  private listeners = new Set<(notification: NotificationItem) => void>();
  private connectionState: "connected" | "connecting" | "disconnected" = "disconnected";

  constructor(private readonly options: FirebaseAdapterOptions) {}

  async connect(): Promise<void> {
    this.connectionState = "connecting";
    this.unsubscribeSnapshot = this.options.client.onNotification((item) => {
      this.listeners.forEach((listener) => listener(item));
    });
    this.connectionState = "connected";
  }

  async disconnect(): Promise<void> {
    this.unsubscribeSnapshot?.();
    this.unsubscribeSnapshot = null;
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
