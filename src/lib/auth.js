import { emitAuthChange } from "@/hooks/useNotification";
import { isSupportedRole } from "@/lib/rbac";

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function decodeBase64Url(value) {
  try {
    const normalized = String(value || "")
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const padding = normalized.length % 4;
    const padded =
      padding === 0
        ? normalized
        : normalized.padEnd(normalized.length + (4 - padding), "=");
    return atob(padded);
  } catch {
    return null;
  }
}

function tryParseJson(value) {
  if (!value || typeof value !== "string") return null;

  const variants = [value];

  try {
    const decoded = decodeURIComponent(value);
    if (decoded !== value) variants.push(decoded);
  } catch {}

  const base64Decoded = decodeBase64Url(value);
  if (base64Decoded) variants.push(base64Decoded);

  for (const candidate of variants) {
    try {
      return JSON.parse(candidate);
    } catch {}
  }

  return null;
}

function pickFirst(params, keys) {
  for (const key of keys) {
    const value = params.get(key);
    if (value) return value;
  }
  return null;
}

function normalizeUser(value) {
  if (!value) return null;
  if (typeof value === "object") {
    if (value.user && typeof value.user === "object") return value.user;
    return value;
  }
  return tryParseJson(value);
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return fallback;
}

function normalizeAuthPayload(payload) {
  const source = payload?.data && typeof payload.data === "object" ? payload.data : payload;
  if (!source || typeof source !== "object") return null;

  const accessToken =
    source.accessToken || source.access_token || source.token || source.jwt || null;
  const refreshToken =
    source.refreshToken || source.refresh_token || source.refresh || null;
  const user = normalizeUser(source.user || source.userData || source.profile);
  const isFirstLogin = normalizeBoolean(
    source.isFirstLogin ?? source.firstLogin ?? user?.isFirstLogin,
    false,
  );

  if (!accessToken || !user) return null;

  return {
    accessToken,
    refreshToken,
    user,
    isFirstLogin,
  };
}

export function extractAuthPayloadFromUrl(url = window.location.href) {
  const currentUrl = new URL(url);
  const searchParams = currentUrl.searchParams;
  const hash = currentUrl.hash.startsWith("#")
    ? currentUrl.hash.slice(1)
    : currentUrl.hash;
  const hashParams = new URLSearchParams(hash);

  const accessToken =
    pickFirst(searchParams, ["accessToken", "access_token", "token", "jwt"]) ||
    pickFirst(hashParams, ["accessToken", "access_token", "token", "jwt"]);
  const refreshToken =
    pickFirst(searchParams, ["refreshToken", "refresh_token", "refresh"]) ||
    pickFirst(hashParams, ["refreshToken", "refresh_token", "refresh"]);
  const userRaw =
    pickFirst(searchParams, ["user", "userData", "profile"]) ||
    pickFirst(hashParams, ["user", "userData", "profile"]);
  const isFirstLogin =
    pickFirst(searchParams, ["isFirstLogin", "firstLogin"]) ||
    pickFirst(hashParams, ["isFirstLogin", "firstLogin"]);

  const directPayload = normalizeAuthPayload({
    accessToken,
    refreshToken,
    user: userRaw,
    isFirstLogin,
  });
  if (directPayload) return directPayload;

  const nestedPayloadRaw =
    pickFirst(searchParams, ["data", "payload", "session"]) ||
    pickFirst(hashParams, ["data", "payload", "session"]);
  const nestedPayload = tryParseJson(nestedPayloadRaw);

  return normalizeAuthPayload(nestedPayload);
}

export function getGoogleAuthUrl(apiBase, redirectPath = "/auth/google/callback") {
  if (!apiBase) throw new Error("API manzili sozlanmagan");
  void redirectPath;
  return `${apiBase}/auth/google`;
}

export async function persistAuthSession(data, apiBase) {
  const authData = normalizeAuthPayload(data);
  if (!authData?.accessToken || !authData?.user) {
    throw new Error("Server login javobini to'liq qaytarmadi");
  }

  const role = authData.user.role;
  if (!isSupportedRole(role)) {
    localStorage.clear();
    throw new Error("Sizning profilingizga bu CRM da ruxsat berilmagan");
  }

  localStorage.setItem("user", authData.accessToken);
  localStorage.setItem("companyId", authData.user.companyId ?? "");
  localStorage.setItem("isFirstLogin", String(Boolean(authData.isFirstLogin)));
  localStorage.setItem(
    "userData",
    JSON.stringify({
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      user: authData.user,
    }),
  );
  emitAuthChange();

  if (!apiBase) return authData;

  try {
    const projectsRes = await fetch(`${apiBase}/projects`, {
      headers: { Authorization: `Bearer ${authData.accessToken}` },
    });
    if (projectsRes.ok) {
      const projects = await parseJsonSafe(projectsRes);
      if (Array.isArray(projects) && projects.length > 0) {
        localStorage.setItem("projectId", String(projects[0].id));
        localStorage.setItem("projectName", projects[0].name || "");
      }
    }
  } catch {}

  return authData;
}
