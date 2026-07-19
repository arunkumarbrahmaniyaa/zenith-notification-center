import { useNotificationContext } from "../providers/NotificationProvider";

export const useToast = () => {
  const { toast, toasts } = useNotificationContext();
  return { toast, toasts };
};
