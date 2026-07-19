import { useMemo } from "react";
import { groupNotifications } from "../utils/grouping";
import { useNotificationContext } from "../providers/NotificationProvider";

export const useNotifications = () => {
  const context = useNotificationContext();

  const groups = useMemo(() => {
    return groupNotifications(context.notifications, context.groupBy);
  }, [context.notifications, context.groupBy]);

  return {
    ...context,
    groups
  };
};
