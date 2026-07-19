import { useNotificationContext } from "../providers/NotificationProvider";

export const useNotificationActions = () => {
  const {
    add,
    remove,
    update,
    archive,
    pin,
    star,
    markRead,
    markUnread,
    markAllRead,
    clear,
    sync
  } = useNotificationContext();

  return {
    addNotification: add,
    removeNotification: remove,
    updateNotification: update,
    archive,
    pin,
    star,
    markRead,
    markUnread,
    markAllRead,
    clear,
    sync
  };
};
