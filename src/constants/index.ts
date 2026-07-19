import type { NotificationPriority, NotificationSort, NotificationType, ToastPosition } from "../types";

export const NOTIFICATION_TYPES: NotificationType[] = [
  "success",
  "error",
  "warning",
  "info",
  "primary",
  "secondary",
  "system",
  "chat",
  "mention",
  "reminder",
  "calendar",
  "meeting",
  "task",
  "upload",
  "download",
  "security",
  "approval",
  "marketing",
  "announcement",
  "custom"
];

export const PRIORITY_ORDER: Record<NotificationPriority, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  silent: 1
};

export const DEFAULT_TOAST_POSITION: ToastPosition = "top-right";

export const DEFAULT_SORT: NotificationSort = "newest";

export const DEFAULT_STORAGE_KEY = "znc.notifications";
export const DEFAULT_OFFLINE_QUEUE_KEY = "znc.offline.queue";
