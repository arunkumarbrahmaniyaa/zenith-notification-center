export const browserSupportsNotification = (): boolean => {
  return typeof window !== "undefined" && "Notification" in window;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission | "unsupported"> => {
  if (!browserSupportsNotification()) {
    return "unsupported";
  }

  return window.Notification.requestPermission();
};
