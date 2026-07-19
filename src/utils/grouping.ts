import { isToday, isYesterday } from "./time";
import type { NotificationGroup, NotificationGroupBy, NotificationItem } from "../types";

const dateGroup = (timestamp: number): string => {
  if (isToday(timestamp)) return "Today";
  if (isYesterday(timestamp)) return "Yesterday";
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  if (timestamp >= sevenDaysAgo) return "Last Week";
  return "Earlier";
};

export const groupNotifications = (
  notifications: NotificationItem[],
  groupBy: NotificationGroupBy
): NotificationGroup[] => {
  if (groupBy === "none") {
    return [{ id: "all", title: "All", unreadCount: notifications.filter((n) => !n.read).length, notifications }];
  }

  const grouped = notifications.reduce<Map<string, NotificationItem[]>>((acc, item) => {
    const key =
      typeof groupBy === "function"
        ? groupBy(item)
        : groupBy === "sender"
          ? item.sender?.name ?? "Unknown Sender"
          : groupBy === "application"
            ? String(item.metadata?.application ?? "General")
            : groupBy === "date"
              ? dateGroup(item.timestamp)
              : groupBy === "category"
                ? item.category
                : groupBy === "priority"
                  ? item.priority
                  : String(item.metadata?.[groupBy] ?? "Other");

    const list = acc.get(key) ?? [];
    list.push(item);
    acc.set(key, list);
    return acc;
  }, new Map());

  return [...grouped.entries()].map(([title, items]) => ({
    id: title.toLowerCase().replace(/\s+/g, "-"),
    title,
    unreadCount: items.filter((item) => !item.read).length,
    notifications: items
  }));
};
