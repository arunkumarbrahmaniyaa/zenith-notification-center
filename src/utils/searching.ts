import type { NotificationItem } from "../types";

export const searchNotifications = (
  notifications: NotificationItem[],
  query: string
): NotificationItem[] => {
  const value = query.trim().toLowerCase();
  if (!value) return notifications;

  return notifications.filter((item) => {
    const bag = [
      item.title,
      item.message,
      item.description ?? "",
      item.sender?.name ?? "",
      item.category,
      ...(item.tags ?? []),
      JSON.stringify(item.metadata ?? {})
    ]
      .join(" ")
      .toLowerCase();

    return bag.includes(value);
  });
};
