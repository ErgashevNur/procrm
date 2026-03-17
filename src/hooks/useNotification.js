import { useEffect, useState, useCallback } from "react";
import { messaging } from "../firebase/firebaseConfig";
import { getToken, onMessage } from "firebase/messaging";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../services/notificationService"; // 👈 import

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// ─────────────────────────────────────────────
// 📱 FCM Device token olish
// ─────────────────────────────────────────────
export const requestDeviceToken = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) return null;

  try {
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") return null;

    const fallbackToken = localStorage.getItem("deviceToken");
    if (!VAPID_KEY) return fallbackToken || null;

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
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

// ─────────────────────────────────────────────
// 🪝 HOOK
// ─────────────────────────────────────────────
export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!localStorage.getItem("user")) {
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getMyNotifications();
      setNotifications(Array.isArray(data) ? data : (data.data ?? []));
    } catch (err) {
      console.error("Notificationlar yuklanmadi:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!localStorage.getItem("user")) {
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
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
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
    } catch (err) {
      console.error("Hammasi o'qildi belgilanmadi:", err);
    }
  }, []);

  // App ochiq paytda kelgan notification
  useEffect(() => {
    if (!localStorage.getItem("user")) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground xabar keldi:", payload);
      const newNotif = {
        id: Date.now(),
        title: payload.notification?.title,
        body: payload.notification?.body,
        isRead: false,
        data: payload.data,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
    return () => unsubscribe();
  }, []);

  // Boshlang'ich yuklash
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    handleMarkAsRead,
    handleMarkAllAsRead,
  };
};
