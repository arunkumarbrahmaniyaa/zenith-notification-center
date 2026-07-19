import { PRIORITY_ORDER } from "../constants";
import type { NotificationItem, NotificationSort } from "../types";

export const sortNotifications = (
  notifications: NotificationItem[],
  sortBy: NotificationSort
): NotificationItem[] => {
  const next = [...notifications];

  next.sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return a.timestamp - b.timestamp;
      case "priority":
        return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      case "unread-first":
        return Number(a.read) - Number(b.read);
      case "alphabetical":
        return a.title.localeCompare(b.title);
      case "sender":
        return (a.sender?.name ?? "").localeCompare(b.sender?.name ?? "");
      case "category":
        return a.category.localeCompare(b.category);
      case "newest":
      default:
        return b.timestamp - a.timestamp;
    }
  });

  return next;
};
