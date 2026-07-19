import { useMemo } from "react";
import { useNotificationContext } from "../providers/NotificationProvider";

export const useInbox = () => {
  const context = useNotificationContext();

  const unread = useMemo(
    () => context.notifications.filter((item) => !item.read),
    [context.notifications]
  );

  const read = useMemo(
    () => context.notifications.filter((item) => item.read),
    [context.notifications]
  );

  return {
    unread,
    read,
    total: context.notifications.length,
    ...context
  };
};
