/* eslint-disable no-restricted-globals */
/**
 * Zenith Notification Center service worker.
 *
 * Copy this file into your app's public directory (served at the root, e.g.
 * `/znc-sw.js`) and register it via `PushService.register("/znc-sw.js")` or
 * the `usePushSubscription` hook.
 *
 * It handles:
 *  - `push` events (foreground/background notifications)
 *  - `notificationclick` (focus/open a client window)
 *  - `notificationclose` (analytics beacon hook)
 */

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (error) {
    payload = { title: "Notification", message: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Notification";
  const options = {
    body: payload.message || payload.body || "",
    icon: payload.icon || "/icons/notification.png",
    badge: payload.badge || "/icons/badge.png",
    image: payload.image,
    tag: payload.tag || payload.groupId,
    data: {
      url: payload.actionUrl || "/",
      ...payload.data
    },
    actions: Array.isArray(payload.buttons)
      ? payload.buttons.slice(0, 2).map((button) => ({
          action: button.action,
          title: button.label
        }))
      : undefined,
    requireInteraction: payload.priority === "critical",
    silent: payload.priority === "silent"
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.postMessage({ type: "notificationclick", action: event.action, url: targetUrl });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});

self.addEventListener("notificationclose", (event) => {
  const data = event.notification.data || {};
  if (data.analyticsUrl) {
    self.registration.active &&
      fetch(data.analyticsUrl, {
        method: "POST",
        keepalive: true,
        body: JSON.stringify({ type: "notificationclose", tag: event.notification.tag })
      }).catch(() => undefined);
  }
});
