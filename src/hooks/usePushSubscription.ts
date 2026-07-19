import { useCallback, useEffect, useMemo, useState } from "react";
import { PushService, type PushSubscribeOptions } from "../services/PushService";

export interface UsePushSubscriptionResult {
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  subscription: PushSubscription | null;
  subscribe: (options: PushSubscribeOptions) => Promise<PushSubscription | null>;
  unsubscribe: () => Promise<boolean>;
  register: (path?: string, scope?: string) => Promise<ServiceWorkerRegistration | null>;
}

/**
 * Hook wrapping the service-worker Web Push workflow: register, subscribe,
 * unsubscribe, and track the current subscription/permission state.
 */
export const usePushSubscription = (): UsePushSubscriptionResult => {
  const service = useMemo(() => new PushService(), []);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  const supported =
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    typeof window !== "undefined" &&
    "PushManager" in window;

  useEffect(() => {
    let active = true;
    void service.getPermission().then((value) => {
      if (active) setPermission(value);
    });
    void service.getSubscription().then((value) => {
      if (active) setSubscription(value);
    });
    return () => {
      active = false;
    };
  }, [service]);

  const register = useCallback(
    (path?: string, scope?: string) => service.register(path, scope),
    [service]
  );

  const subscribe = useCallback(
    async (options: PushSubscribeOptions) => {
      const result = await service.subscribe(options);
      setSubscription(result);
      setPermission(await service.getPermission());
      return result;
    },
    [service]
  );

  const unsubscribe = useCallback(async () => {
    const result = await service.unsubscribe();
    if (result) setSubscription(null);
    return result;
  }, [service]);

  return { supported, permission, subscription, subscribe, unsubscribe, register };
};
