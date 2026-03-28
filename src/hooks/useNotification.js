import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getFirebaseMessaging } from "../firebase/firebaseConfig";
import { getToken, onMessage } from "firebase/messaging";
import {
  registerDeviceToken,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../services/notificationService";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const AUTH_CHANGE_EVENT = "prohome:auth-changed";
const SW_NOTIFICATION_MESSAGE = "prohome:notification-message";
const BROADCAST_CHANNEL_NAME = "prohome-notifications";
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

function hasTaskKeyword(value) {
  const normalized = String(value || "").toLowerCase();
  return (
    normalized.includes("task") ||
    normalized.includes("vazifa") ||
    normalized.includes("todo") ||
    normalized.includes("deadline") ||
    normalized.includes("assignment") ||
    normalized.includes("assign")
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

function isTaskNotification(notification) {
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
  ].some(hasTaskKeyword);
}

function normalizeNotificationPayload(payload) {
  if (!payload) return null;

  const data = payload.data || {};
  const notification = payload.notification || {};
  const title = notification.title || data.title || "Yangi bildirishnoma";
  const body = notification.body || data.body || data.message || "";
  const createdAt =
    data.createdAt || data.created_at || payload.createdAt || new Date().toISOString();

  return {
    id: data.id || payload.id || `${title}:${body}:${createdAt}`,
    title,
    body,
    isRead: false,
    data,
    createdAt,
  };
}

function mergeNotifications(currentList, incomingNotification) {
  if (!incomingNotification) return currentList;

  const incomingId = String(incomingNotification.id ?? "");
  const nextList = [incomingNotification];

  for (const item of currentList) {
    const itemId = String(item?.id ?? "");
    if (incomingId && itemId === incomingId) continue;
    nextList.push(item);
  }

  return nextList;
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

    const messaging = await getFirebaseMessaging();
    if (!messaging) return fallbackToken || null;

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
  const [taskNotificationCount, setTaskNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(hasActiveSession);

  const notificationAudioRef = useRef(null);
  const pendingSoundRef = useRef(false);
  const notificationsRef = useRef([]);
  const knownNotificationIdsRef = useRef(new Set());
  const broadcastChannelRef = useRef(null);
  // Eski (stale) fetch responselarini bekor qilish uchun
  const fetchCounterRef = useRef(0);

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
      notificationAudioRef.current.play().catch((err) => {
        if (err.name === "NotAllowedError") {
          pendingSoundRef.current = true;
        }
      });
    } catch (error) {
      console.error("Notification ovozini ijro etishda xato:", error);
    }
  }, []);

  const showBrowserNotification = useCallback(async (notification) => {
    if (
      typeof window === "undefined" ||
      !notification ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    const options = {
      body: notification.body || "",
      icon: "/ProHomeLogo.png",
      badge: "/ProHomeLogo.png",
      data: notification.data || {},
      tag: String(notification.id ?? ""),
    };

    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(notification.title, options);
        return;
      }
    } catch {
      // serviceWorker.showNotification ishlamasa native ga o'tamiz
    }

    try {
      new Notification(notification.title, options);
    } catch (error) {
      console.error("Native notification ko'rsatilmadi:", error);
    }
  }, []);

  const syncNotificationState = useCallback(
    (list, options = {}) => {
      const normalizedList = Array.isArray(list) ? list : [];
      const unread = normalizedList.filter((item) => !item?.isRead);
      const unreadLeadCount = unread.filter(isLeadNotification).length;
      const unreadTaskCount = unread.filter(isTaskNotification).length;

      if (options.playSoundForNew) {
        const nextIds = new Set();
        const newNotifications = [];

        for (const item of normalizedList) {
          const key = String(item?.id ?? "");
          if (!key) continue;
          nextIds.add(key);

          if (!knownNotificationIdsRef.current.has(key) && !item?.isRead) {
            newNotifications.push(item);
          }
        }

        knownNotificationIdsRef.current = nextIds;

        if (newNotifications.length > 0) {
          playNotificationSound();

          if (options.showBrowserNotif) {
            for (const notif of newNotifications) {
              showBrowserNotification(notif);
            }
          }
        }
      } else {
        knownNotificationIdsRef.current = new Set(
          normalizedList.map((item) => String(item?.id ?? "")).filter(Boolean),
        );
      }

      setNotifications(normalizedList);
      notificationsRef.current = normalizedList;
      setUnreadCount(unread.length);
      setLeadNotificationCount(unreadLeadCount);
      setTaskNotificationCount(unreadTaskCount);
    },
    [playNotificationSound, showBrowserNotification],
  );

  const pushIncomingNotification = useCallback(
    async (incomingNotification, options = {}) => {
      if (!incomingNotification) return;

      syncNotificationState(
        mergeNotifications(notificationsRef.current, incomingNotification),
        {
          playSoundForNew: options.playSoundForNew ?? true,
          showBrowserNotif: false,
        },
      );

      if (options.showBrowserNotification) {
        await showBrowserNotification(incomingNotification);
      }

      if (
        options.broadcast !== false &&
        broadcastChannelRef.current &&
        typeof broadcastChannelRef.current.postMessage === "function"
      ) {
        broadcastChannelRef.current.postMessage({
          type: SW_NOTIFICATION_MESSAGE,
          notification: incomingNotification,
        });
      }
    },
    [showBrowserNotification, syncNotificationState],
  );

  const fetchNotifications = useCallback(
    async (options = {}) => {
      if (!hasActiveSession()) {
        setNotifications([]);
        return;
      }

      // Har bir fetchga noyob ID beramiz — eski (stale) responselarni bekor qilish uchun
      const fetchId = ++fetchCounterRef.current;

      try {
        setLoading(true);
        const data = await getMyNotifications();

        // Agar bu orada yangi fetch boshlangan bo'lsa, bu natijani e'tiborsiz qoldiramiz
        if (fetchId !== fetchCounterRef.current) return;

        const list = Array.isArray(data) ? data : (data.data ?? []);
        syncNotificationState(list, options);
      } catch (err) {
        if (fetchId !== fetchCounterRef.current) return;
        console.error("Notificationlar yuklanmadi:", err);
      } finally {
        if (fetchId === fetchCounterRef.current) {
          setLoading(false);
        }
      }
    },
    [syncNotificationState],
  );

  // handleMarkAsRead: setNotifications updater ichida boshqa setState chaqirish
  // React anti-pattern. notificationsRef orqali targetni oldinroq topamiz.
  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markAsRead(id);

      const target = notificationsRef.current.find((n) => n.id === id);
      if (target && !target.isRead) {
        if (isLeadNotification(target)) {
          setLeadNotificationCount((c) => Math.max(0, c - 1));
        }
        if (isTaskNotification(target)) {
          setTaskNotificationCount((c) => Math.max(0, c - 1));
        }
        setUnreadCount((c) => Math.max(0, c - 1));
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      notificationsRef.current = notificationsRef.current.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      );
    } catch (err) {
      console.error("O'qildi belgilanmadi:", err);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      const updated = notificationsRef.current.map((n) => ({ ...n, isRead: true }));
      setNotifications(updated);
      notificationsRef.current = updated;
      setUnreadCount(0);
      setLeadNotificationCount(0);
      setTaskNotificationCount(0);
    } catch (err) {
      console.error("Hammasi o'qildi belgilanmadi:", err);
    }
  }, []);

  const resetLeadNotificationCount = useCallback(() => {
    setLeadNotificationCount(0);
  }, []);

  const resetTaskNotificationCount = useCallback(() => {
    setTaskNotificationCount(0);
  }, []);

  // Audio unlock — foydalanuvchi birinchi interaksiyada kutilgan ovozni chiqaradi
  useEffect(() => {
    const unlock = () => {
      if (!pendingSoundRef.current || !notificationAudioRef.current) return;
      pendingSoundRef.current = false;
      notificationAudioRef.current.currentTime = 0;
      notificationAudioRef.current.play().catch(() => {});
    };

    document.addEventListener("click", unlock);
    document.addEventListener("keydown", unlock);
    document.addEventListener("touchstart", unlock);

    return () => {
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("touchstart", unlock);
    };
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
      setTaskNotificationCount(0);
      setLoading(false);
      return;
    }

    fetchNotifications();
  }, [fetchNotifications, isAuthenticated]);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return;
    }

    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannelRef.current = channel;

    channel.onmessage = (event) => {
      if (event.data?.type !== SW_NOTIFICATION_MESSAGE) return;
      pushIncomingNotification(event.data.notification, {
        playSoundForNew: true,
        showBrowserNotification: false,
        broadcast: false,
      });
    };

    return () => {
      if (broadcastChannelRef.current === channel) {
        broadcastChannelRef.current = null;
      }
      channel.close();
    };
  }, [pushIncomingNotification]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const runSync = () => {
      fetchNotifications({ playSoundForNew: true, showBrowserNotif: true });
    };

    const intervalId = window.setInterval(runSync, NOTIFICATION_POLL_INTERVAL);

    const handleFocus = () => runSync();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") runSync();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchNotifications, isAuthenticated]);

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

    let unsubscribe = null;
    let disposed = false;

    const setupForegroundListener = async () => {
      try {
        const messaging = await getFirebaseMessaging();
        if (!messaging || disposed) return;

        unsubscribe = onMessage(messaging, (payload) => {
          const newNotification = normalizeNotificationPayload(payload);
          pushIncomingNotification(newNotification, {
            playSoundForNew: true,
            showBrowserNotification: true,
          });
        });
      } catch (error) {
        console.error("Foreground notification listener ishga tushmadi:", error);
      }
    };

    setupForegroundListener();

    return () => {
      disposed = true;
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [isAuthenticated, pushIncomingNotification]);

  useEffect(() => {
    if (
      !isAuthenticated ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type !== SW_NOTIFICATION_MESSAGE) return;

      const newNotification = normalizeNotificationPayload(event.data.payload);
      pushIncomingNotification(newNotification, {
        playSoundForNew: true,
        showBrowserNotification: false,
      });
    };

    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);

    return () => {
      navigator.serviceWorker.removeEventListener(
        "message",
        handleServiceWorkerMessage,
      );
    };
  }, [isAuthenticated, pushIncomingNotification]);

  return createElement(
    NotificationContext.Provider,
    {
      value: {
        notifications,
        unreadCount,
        leadNotificationCount,
        taskNotificationCount,
        loading,
        fetchNotifications,
        handleMarkAsRead,
        handleMarkAllAsRead,
        resetLeadNotificationCount,
        resetTaskNotificationCount,
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
