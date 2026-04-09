const RAW_API = String(import.meta.env.VITE_VITE_API_KEY_PROHOME || "")
  .trim()
  .replace(/\/+$/, "");

export const API = import.meta.env.DEV ? "/api/v1" : RAW_API;
export const IMAGE_API = API ? `${API}/image` : "";

  