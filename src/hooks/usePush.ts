import { useCallback } from "react";
import { useNotificationContext } from "../providers/NotificationProvider";
import { requestNotificationPermission } from "../utils/permissions";

export const usePush = () => {
  const { permission } = useNotificationContext();

  const request = useCallback(async () => {
    return requestNotificationPermission();
  }, []);

  return {
    permission,
    request
  };
};
