import { apiUrl } from "@/lib/api";

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("user");
  const headers = { Authorization: `Bearer ${token}`, ...options.headers };
  if (
    options.body !== undefined &&
    !(options.body instanceof FormData) &&
    !Object.keys(headers).some((k) => k.toLowerCase() === "content-type")
  ) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(url, { ...options, headers });
}

async function readJson(res) {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function getFacebookOAuthUrl(redirectUri) {
  const url = redirectUri
    ? apiUrl(`facebook/oauth/url?redirectUri=${encodeURIComponent(redirectUri)}`)
    : apiUrl("facebook/oauth/url");
  const res = await apiFetch(url);
  if (!res.ok) throw new Error("OAuth URL olishda xato");
  return readJson(res);
}

export async function exchangeFacebookCode(code, redirectUri) {
  const body = redirectUri ? { code, redirectUri } : { code };
  const res = await apiFetch(apiUrl("facebook/oauth/exchange"), {
    method: "POST",
    body: JSON.stringify(body),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error(data?.message || "Token olishda xato");
  return data;
}

export async function getFacebookConnections() {
  const res = await apiFetch(apiUrl("facebook/connections"));
  if (!res.ok) return [];
  return (await readJson(res)) || [];
}

export async function getFacebookPages() {
  const res = await apiFetch(apiUrl("facebook/pages"));
  if (!res.ok) throw new Error("Sahifalar yuklanmadi");
  return (await readJson(res)) || [];
}

export async function syncFacebookPages() {
  const res = await apiFetch(apiUrl("facebook/pages/sync"), { method: "POST" });
  if (!res.ok) throw new Error("Sync amalga oshmadi");
  return readJson(res);
}

export async function subscribeFacebookPage(pageId, options = {}) {
  const body = { isActive: true, ...options };
  const res = await apiFetch(apiUrl(`facebook/pages/${pageId}/subscribe`), {
    method: "POST",
    body: JSON.stringify(body),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error(data?.message || "Subscribe amalga oshmadi");
  return data;
}

export async function getFacebookPageForms(pageId) {
  const res = await apiFetch(apiUrl(`facebook/pages/${pageId}/forms`));
  if (!res.ok) throw new Error("Formalar yuklanmadi");
  return (await readJson(res)) || [];
}

export async function saveFacebookFormMapping(pageId, externalFormId, body) {
  const res = await apiFetch(
    apiUrl(`facebook/pages/${pageId}/forms/${externalFormId}/mapping`),
    { method: "POST", body: JSON.stringify(body) },
  );
  const data = await readJson(res);
  if (!res.ok) throw new Error(data?.message || "Mapping saqlanmadi");
  return data;
}

export async function getFacebookMappingOptions() {
  const res = await apiFetch(apiUrl("facebook/mapping-options"));
  if (!res.ok) return { fields: [] };
  return (await res.json()) || { fields: [] };
}
