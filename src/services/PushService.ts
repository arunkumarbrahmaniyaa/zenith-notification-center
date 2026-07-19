import { browserSupportsNotification, requestNotificationPermission } from "../utils/permissions";

export interface PushSubscribeOptions {
  /** URL-safe base64 VAPID public key. */
  vapidPublicKey: string;
  /** Path to the service worker script. Defaults to "/znc-sw.js". */
  serviceWorkerPath?: string;
  /** Service worker registration scope. */
  scope?: string;
}

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
};

const supportsServiceWorker = (): boolean =>
  typeof navigator !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

export class PushService {
  async getPermission(): Promise<NotificationPermission | "unsupported"> {
    if (!browserSupportsNotification()) return "unsupported";
    return window.Notification.permission;
  }

  async requestPermission(): Promise<NotificationPermission | "unsupported"> {
    return requestNotificationPermission();
  }

  notify(title: string, options?: NotificationOptions): Notification | null {
    if (!browserSupportsNotification()) return null;
    if (window.Notification.permission !== "granted") return null;
    return new window.Notification(title, options);
  }

  /** Register the notification service worker. */
  async register(
    path = "/znc-sw.js",
    scope?: string
  ): Promise<ServiceWorkerRegistration | null> {
    if (!supportsServiceWorker()) return null;
    return navigator.serviceWorker.register(path, scope ? { scope } : undefined);
  }

  /** Subscribe the browser to Web Push notifications. */
  async subscribe(options: PushSubscribeOptions): Promise<PushSubscription | null> {
    if (!supportsServiceWorker()) return null;

    const permission = await this.requestPermission();
    if (permission !== "granted") return null;

    const registration =
      (await navigator.serviceWorker.getRegistration(options.scope)) ??
      (await this.register(options.serviceWorkerPath, options.scope));
    if (!registration) return null;

    await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;

    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(options.vapidPublicKey) as BufferSource
    });
  }

  /** Unsubscribe the browser from Web Push notifications. */
  async unsubscribe(): Promise<boolean> {
    if (!supportsServiceWorker()) return false;

    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return false;

    return subscription.unsubscribe();
  }

  /** Return the current push subscription, if any. */
  async getSubscription(): Promise<PushSubscription | null> {
    if (!supportsServiceWorker()) return null;
    const registration = await navigator.serviceWorker.getRegistration();
    return (await registration?.pushManager.getSubscription()) ?? null;
  }
}
