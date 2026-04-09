import { API as API_BASE } from "@/lib/api";

// ─────────────────────────────────────────────
// 🔧 userData dan accessToken olish
// ─────────────────────────────────────────────
const getUserToken = () => {
  try {
    const raw = JSON.parse(localStorage.getItem("userData"));
    return raw?.accessToken ?? raw?.userData?.accessToken ?? null;
  } catch {
    return null;
  }
};

const getHeaders = () => ({
  accept: "*/*",
  "Content-Type": "application/json",
  Authorization: `Bearer ${getUserToken()}`,
});

// ─────────────────────────────────────────────
// 🌐 API FUNKSIYALAR
// ─────────────────────────────────────────────

// Token backendga saqlash (login paytida chaqiriladi)
export const registerDeviceToken = async (
  accessTokenArg,
  deviceTokenArg,
) => {
  const accessToken = accessTokenArg || getUserToken();
  const token = deviceTokenArg || localStorage.getItem("deviceToken");
  if (!API_BASE || !accessToken || !token) return;

  const res = await fetch(`${API_BASE}/auth/device-token`, {
    method: "POST",
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error("Device tokenni backendga yuborib bo'lmadi");
};

// Token o'chirish (logout paytida chaqiriladi)
export const removeDeviceToken = async () => {
  const token = localStorage.getItem("deviceToken");
  if (!token) return;
  await fetch(`${API_BASE}/notifications/device-token/${token}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  localStorage.removeItem("deviceToken");
};

// Notificationlar ro'yxati
export const getMyNotifications = async () => {
  if (!getUserToken()) return [];
  const res = await fetch(`${API_BASE}/notifications/my`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

  return res.json();
};

// O'qilmagan soni
export const getUnreadCount = async () => {
  if (!getUserToken()) return { count: 0 };
  const res = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
};

// Bitta notificationni o'qildi
export const markAsRead = async (notificationId) => {
  if (!getUserToken()) return;
  await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: getHeaders(),
  });
};

// Hammasini o'qildi
export const markAllAsRead = async () => {
  if (!getUserToken()) return;
  await fetch(`${API_BASE}/notifications/read-all`, {
    method: "PATCH",
    headers: getHeaders(),
  });
};
