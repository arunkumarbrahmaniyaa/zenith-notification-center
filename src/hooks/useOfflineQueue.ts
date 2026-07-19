import { useNotificationContext } from "../providers/NotificationProvider";

export const useOfflineQueue = () => {
  const { isOnline, add, update, remove } = useNotificationContext();

  return {
    isOnline,
    queueAdd: add,
    queueUpdate: update,
    queueRemove: remove
  };
};
