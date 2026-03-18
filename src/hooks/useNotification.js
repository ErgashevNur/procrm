import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { messaging } from "../firebase/firebaseConfig";
import { getToken, onMessage } from "firebase/messaging";
import {
  registerDeviceToken,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../services/notificationService";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const AUTH_CHANGE_EVENT = "prohome:auth-changed";
const NotificationContext = createContext(null);
const NOTIFICATION_POLL_INTERVAL = 15000;

function hasActiveSession() {
  return Boolean(localStorage.getItem("user"));
}

function hasLeadKeyword(value) {
  const normalized = String(value || "").toLowerCase();
  return (
    normalized.includes("lead") ||
    normalized.includes("mijoz") ||
    normalized.includes("klient") ||
    normalized.includes("client")
  );
}

function isLeadNotification(notification) {
  if (!notification) return false;

  const data = notification.data || {};
  return [
    notification.title,
    notification.body,
    data.type,
    data.event,
    data.module,
    data.entity,
    data.resource,
    data.resourceType,
    data.link,
  ].some(hasLeadKeyword);
}

export function emitAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export const requestDeviceToken = async () => {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !window.isSecureContext
  ) {
    return null;
  }

  try {
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") return null;

    const fallbackToken = localStorage.getItem("deviceToken");
    if (!VAPID_KEY) return fallbackToken || null;

    const serviceWorkerRegistration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration,
    });

    if (token) {
      localStorage.setItem("deviceToken", token);
      return token;
    }
    return fallbackToken || null;
  } catch (error) {
    console.error("Device token olishda xato:", error);
    return localStorage.getItem("deviceToken");
  }
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [leadNotificationCount, setLeadNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(hasActiveSession);
  const notificationAudioRef = useRef(null);
  const notificationsRef = useRef([]);
  const knownNotificationIdsRef = useRef(new Set());

  const syncAuthState = useCallback(() => {
    setIsAuthenticated(hasActiveSession());
  }, []);

  const playNotificationSound = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      if (!notificationAudioRef.current) {
        notificationAudioRef.current = new Audio("/lead_sound.mp3");
        notificationAudioRef.current.preload = "auto";
      }

      notificationAudioRef.current.currentTime = 0;
      notificationAudioRef.current.play().catch(() => {});
    } catch (error) {
      console.error("Notification ovozini ijro etishda xato:", error);
    }
  }, []);

  const syncNotificationState = useCallback(
    (list, options = {}) => {
      const normalizedList = Array.isArray(list) ? list : [];
      const unread = normalizedList.filter((item) => !item?.isRead);
      const unreadLeadCount = unread.filter(isLeadNotification).length;

      if (options.playSoundForNew) {
        const nextIds = new Set();
        let hasNewLeadNotification = false;

        for (const item of normalizedList) {
          const key = String(item?.id ?? "");
          if (!key) continue;
          nextIds.add(key);

          if (
            !knownNotificationIdsRef.current.has(key) &&
            !item?.isRead &&
            isLeadNotification(item)
          ) {
            hasNewLeadNotification = true;
          }
        }

        knownNotificationIdsRef.current = nextIds;

        if (hasNewLeadNotification) {
          playNotificationSound();
        }
      } else {
        knownNotificationIdsRef.current = new Set(
          normalizedList
            .map((item) => String(item?.id ?? ""))
            .filter(Boolean),
        );
      }

      setNotifications(normalizedList);
      notificationsRef.current = normalizedList;
      setUnreadCount(unread.length);
      setLeadNotificationCount(unreadLeadCount);
    },
    [playNotificationSound],
  );

  const fetchNotifications = useCallback(async (options = {}) => {
    if (!hasActiveSession()) {
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getMyNotifications();
      const list = Array.isArray(data) ? data : (data.data ?? []);
      syncNotificationState(list, options);
    } catch (err) {
      console.error("Notificationlar yuklanmadi:", err);
    } finally {
      setLoading(false);
    }
  }, [syncNotificationState]);

  const fetchUnreadCount = useCallback(async () => {
    if (!hasActiveSession()) {
      setUnreadCount(0);
      return;
    }

    try {
      const data = await getUnreadCount();
      setUnreadCount(data?.count ?? data?.unreadCount ?? 0);
    } catch (err) {
      console.error("Unread count yuklanmadi:", err);
    }
  }, []);

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === id);
        if (target && isLeadNotification(target) && !target.isRead) {
          setLeadNotificationCount((prevCount) => Math.max(0, prevCount - 1));
        }

        return prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      });
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("O'qildi belgilanmadi:", err);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      setLeadNotificationCount(0);
    } catch (err) {
      console.error("Hammasi o'qildi belgilanmadi:", err);
    }
  }, []);

  const resetLeadNotificationCount = useCallback(() => {
    setLeadNotificationCount(0);
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthState);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, [syncAuthState]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setLeadNotificationCount(0);
      setLoading(false);
      return;
    }

    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const runSync = () => {
      fetchNotifications({ playSoundForNew: true });
      fetchUnreadCount();
    };

    const intervalId = window.setInterval(runSync, NOTIFICATION_POLL_INTERVAL);
    const handleFocus = () => runSync();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        runSync();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchNotifications, fetchUnreadCount, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const setupDeviceToken = async () => {
      try {
        const accessToken = localStorage.getItem("user");
        const token = await requestDeviceToken();
        if (!cancelled && accessToken && token) {
          await registerDeviceToken(accessToken, token);
        }
      } catch (error) {
        console.error("Device tokenni ro'yxatdan o'tkazishda xato:", error);
      }
    };

    setupDeviceToken();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const unsubscribe = onMessage(messaging, (payload) => {
        const newNotif = {
          id: payload?.data?.id || Date.now(),
          title: payload.notification?.title || "Yangi bildirishnoma",
          body: payload.notification?.body || "",
          isRead: false,
          data: payload.data,
          createdAt: new Date().toISOString(),
        };

        syncNotificationState([newNotif, ...notificationsRef.current], {
          playSoundForNew: true,
        });
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Foreground notification listener ishga tushmadi:", error);
    }
  }, [isAuthenticated, syncNotificationState]);

  return createElement(
    NotificationContext.Provider,
    {
      value: {
        notifications,
        unreadCount,
        leadNotificationCount,
        loading,
        fetchNotifications,
        handleMarkAsRead,
        handleMarkAllAsRead,
        resetLeadNotificationCount,
      },
    },
    children,
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }

  return context;
}
