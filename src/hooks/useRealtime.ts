import { useNotificationContext } from "../providers/NotificationProvider";

export const useRealtime = () => {
  const { isOnline, sync } = useNotificationContext();

  return {
    isOnline,
    sync
  };
};
