import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { nanoid } from "nanoid";
import { DEFAULT_SORT, DEFAULT_STORAGE_KEY } from "../constants";
import { NotificationService } from "../services/NotificationService";
import { PushService } from "../services/PushService";
import { QueueService, type QueuedAction } from "../services/QueueService";
import { RealtimeService } from "../services/RealtimeService";
import { StorageService } from "../services/StorageService";
import { mergeTheme } from "../themes";
import { applyFilter } from "../utils/filtering";
import { searchNotifications } from "../utils/searching";
import { sortNotifications } from "../utils/sorting";
import type {
  NotificationContextValue,
  NotificationFilter,
  NotificationGroupBy,
  NotificationItem,
  NotificationProviderProps,
  NotificationSort,
  ToastOptions
} from "../types";

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider = ({
  children,
  initialNotifications = [],
  adapter,
  realtime,
  analytics,
  storageKey = DEFAULT_STORAGE_KEY,
  offlineEnabled = true,
  maxNotifications = 5000,
  theme
}: NotificationProviderProps) => {
  const storage = useMemo(() => new StorageService(storageKey), [storageKey]);
  const queue = useMemo(() => new QueueService(`${storageKey}.queue`), [storageKey]);
  const push = useMemo(() => new PushService(), []);
  const serviceRef = useRef(new NotificationService(initialNotifications, adapter, analytics));
  const realtimeRef = useRef(new RealtimeService(realtime));
  const listeners = useRef(new Set<(items: NotificationItem[]) => void>());

  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<NotificationFilter>({});
  const [groupBy, setGroupBy] = useState<NotificationGroupBy>("none");
  const [sortBy, setSortBy] = useState<NotificationSort>(DEFAULT_SORT);
  const [selectedIds] = useState<string[]>([]);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [toastIds, setToastIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = serviceRef.current.subscribe((items) => {
      const bounded = items.slice(0, maxNotifications);
      setNotifications(bounded);
      storage.write(bounded);
      listeners.current.forEach((listener) => listener(bounded));
    });

    const fromStorage = storage.read();
    if (fromStorage.length > 0) {
      serviceRef.current.setNotifications(fromStorage);
    }

    void push.getPermission().then((value) => setPermission(value));
    void serviceRef.current.hydrate();

    return unsubscribe;
  }, [maxNotifications, push, storage]);

  useEffect(() => {
    if (!offlineEnabled || typeof window === "undefined") return;

    const goOnline = () => {
      setIsOnline(true);
      analytics?.onOnline?.();

      const queued = queue.flush();
      queued.forEach((action) => {
        if (action.type === "add") {
          serviceRef.current.add(action.payload as Partial<NotificationItem>);
        }
        if (action.type === "update") {
          serviceRef.current.update(String(action.payload.id), action.payload.patch as Partial<NotificationItem>);
        }
        if (action.type === "remove") {
          serviceRef.current.remove(String(action.payload.id));
        }
      });
    };

    const goOffline = () => {
      setIsOnline(false);
      analytics?.onOffline?.();
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [analytics, offlineEnabled, queue]);

  useEffect(() => {
    void realtimeRef.current.connect((item) => {
      serviceRef.current.add(item);
    });

    return () => {
      void realtimeRef.current.disconnect();
    };
  }, []);

  const enqueueOffline = useCallback(
    (action: QueuedAction) => {
      if (!offlineEnabled || isOnline) return;
      queue.enqueue(action);
    },
    [isOnline, offlineEnabled, queue]
  );

  const add = useCallback(
    (input: Partial<NotificationItem>): NotificationItem => {
      if (!isOnline) {
        enqueueOffline({
          id: nanoid(),
          type: "add",
          payload: input as Record<string, unknown>,
          createdAt: Date.now(),
          retries: 0
        });

        return {
          ...input,
          id: input.id ?? nanoid(),
          title: input.title ?? "Queued notification",
          message: input.message ?? "",
          timestamp: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          type: input.type ?? "info",
          category: input.category ?? "general",
          priority: input.priority ?? "silent",
          status: "queued",
          read: input.read ?? false,
          archived: input.archived ?? false,
          pinned: input.pinned ?? false,
          starred: input.starred ?? false,
          isOffline: true
        } as NotificationItem;
      }

      return serviceRef.current.add(input);
    },
    [enqueueOffline, isOnline]
  );

  const remove = useCallback(
    (id: string) => {
      if (!isOnline) {
        enqueueOffline({
          id: nanoid(),
          type: "remove",
          payload: { id },
          createdAt: Date.now(),
          retries: 0
        });
      }
      serviceRef.current.remove(id);
    },
    [enqueueOffline, isOnline]
  );

  const update = useCallback(
    (id: string, patch: Partial<NotificationItem>) => {
      if (!isOnline) {
        enqueueOffline({
          id: nanoid(),
          type: "update",
          payload: { id, patch: patch as Record<string, unknown> },
          createdAt: Date.now(),
          retries: 0
        });
      }
      serviceRef.current.update(id, patch);
    },
    [enqueueOffline, isOnline]
  );

  const archive = useCallback((id: string) => update(id, { archived: true }), [update]);
  const pin = useCallback((id: string, pinned = true) => update(id, { pinned }), [update]);
  const star = useCallback((id: string, starred = true) => update(id, { starred }), [update]);
  const markRead = useCallback((id: string) => serviceRef.current.markRead(id), []);
  const markUnread = useCallback((id: string) => update(id, { read: false }), [update]);
  const markAllRead = useCallback(() => serviceRef.current.markAllRead(), []);
  const clear = useCallback(() => serviceRef.current.clear(), []);
  const search = useCallback((query: string) => setSearchQuery(query), []);
  const filter = useCallback((nextFilter: NotificationFilter) => setFilters(nextFilter), []);
  const group = useCallback((nextGroupBy: NotificationGroupBy) => setGroupBy(nextGroupBy), []);
  const sort = useCallback((nextSortBy: NotificationSort) => setSortBy(nextSortBy), []);

  const sync = useCallback(async () => {
    await serviceRef.current.sync();
  }, []);

  const subscribe = useCallback((listener: (items: NotificationItem[]) => void) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  const unsubscribe = useCallback((listener: (items: NotificationItem[]) => void) => {
    listeners.current.delete(listener);
  }, []);

  const toastShow = useCallback(
    (options: ToastOptions): string => {
      const item = serviceRef.current.fromToast(options);
      setToastIds((prev) => [item.id, ...prev]);
      analytics?.onToastShown?.(item);

      const duration = options.persistent ? undefined : (options.duration ?? 5000);
      if (duration) {
        window.setTimeout(() => {
          setToastIds((prev) => prev.filter((id) => id !== item.id));
          analytics?.onToastClosed?.(item);
        }, duration);
      }

      return item.id;
    },
    [analytics]
  );

  const toastDismiss = useCallback((id: string) => {
    setToastIds((prev) => prev.filter((current) => current !== id));
  }, []);

  const toastDismissAll = useCallback(() => {
    setToastIds([]);
  }, []);

  const toastPromise = useCallback(
    async <T,>(
      promise: Promise<T>,
      options: {
        loading: ToastOptions;
        success: (value: T) => ToastOptions;
        error: (error: unknown) => ToastOptions;
      }
    ): Promise<T> => {
      const loadingId = toastShow({ ...options.loading, persistent: true });
      try {
        const value = await promise;
        toastDismiss(loadingId);
        toastShow(options.success(value));
        return value;
      } catch (error) {
        toastDismiss(loadingId);
        toastShow(options.error(error));
        throw error;
      }
    },
    [toastDismiss, toastShow]
  );

  const visibleNotifications = useMemo(() => {
    const searched = searchNotifications(notifications, searchQuery);
    const filtered = applyFilter(searched, filters);
    return sortNotifications(filtered, sortBy);
  }, [notifications, searchQuery, filters, sortBy]);

  const activeToasts = useMemo(
    () => toastIds.map((id) => notifications.find((notification) => notification.id === id)).filter(Boolean) as NotificationItem[],
    [notifications, toastIds]
  );

  useEffect(() => {
    if (theme) {
      const merged = mergeTheme(theme);
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        root.style.setProperty("--znc-bg", merged.colors.background);
        root.style.setProperty("--znc-surface", merged.colors.surface);
        root.style.setProperty("--znc-text", merged.colors.text);
        root.style.setProperty("--znc-muted", merged.colors.mutedText);
        root.style.setProperty("--znc-border", merged.colors.border);
        root.style.setProperty("--znc-primary", merged.colors.primary);
        root.style.setProperty("--znc-radius", merged.radius);
        root.style.setProperty("--znc-font", merged.fontFamily);
      }
    }
  }, [theme]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications: visibleNotifications,
      selectedIds,
      searchQuery,
      filters,
      groupBy,
      sortBy,
      isOnline,
      permission,
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
      search,
      filter,
      group,
      sort,
      sync,
      subscribe,
      unsubscribe,
      toasts: activeToasts,
      toast: {
        show: toastShow,
        dismiss: toastDismiss,
        dismissAll: toastDismissAll,
        promise: toastPromise
      }
    }),
    [
      visibleNotifications,
      selectedIds,
      searchQuery,
      filters,
      groupBy,
      sortBy,
      isOnline,
      permission,
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
      search,
      filter,
      group,
      sort,
      sync,
      subscribe,
      unsubscribe,
      activeToasts,
      toastShow,
      toastDismiss,
      toastDismissAll,
      toastPromise
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotificationContext = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used inside NotificationProvider");
  }
  return context;
};
