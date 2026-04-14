const RAW_API_BASE = import.meta.env.VITE_VITE_API_KEY_PROHOME || "";

export const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

export function apiUrl(path = "") {
  const normalizedPath = String(path || "");
  if (!normalizedPath) return API_BASE;
  if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;
  if (normalizedPath.startsWith("/")) return `${API_BASE}${normalizedPath}`;
  return `${API_BASE}/${normalizedPath}`;
}

export function imageUrl(src) {
  if (!src) return null;
  if (/^(blob:|data:|https?:\/\/)/i.test(src)) return src;
  const clean = String(src).replace(/^\/+/, "").replace(/^image\//i, "");
  return apiUrl(`image/${clean}`);
}
