import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  canDeleteData,
  getCurrentRole,
  isSuperAdminLikeRole,
} from "@/lib/rbac";
import { useNavigate } from "react-router-dom";
import CardSkeleton from "@/components/company/CardSkeleton";
import CompanyCard from "@/components/company/CompanyCard";
import CompanyDetailModal from "@/components/company/CompanyDetailModal";
import CompanyDrawer from "@/components/company/CompanyDrawer";
import ConfirmDialog from "@/components/company/ConfirmDialog";

const API_BASE = import.meta.env.VITE_VITE_API_KEY_PROHOME.replace(/\/+$/, "");
const PER_PAGE = 10;
const ALL_PERMISSIONS = ["CRM", "PROHOME"];
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

// ─── Storage helpers ───────────────────────────────────────────────────────────

function parseStorageJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getAccessToken() {
  return (localStorage.getItem("user") || "").trim();
}

function getSuperadminCompanyId() {
  const parsed = parseStorageJSON("userData");
  if (!parsed) return null;
  return parsed?.user?.companyId ?? parsed?.companyId ?? null;
}

// ─── Permission helpers ────────────────────────────────────────────────────────

function normalizePermission(permission) {
  const value = String(permission || "").trim().toUpperCase();
  if (value === "CRM") return "CRM";
  if (value === "PROHOME") return "PROHOME";
  return "";
}

function permissionLabel(permission) {
  return permission === "PROHOME" ? "Prohome" : permission;
}

function normalizePermissions(list, options = {}) {
  const { fallback = [] } = options;
  const normalized = Array.from(
    new Set(
      (Array.isArray(list) ? list : [])
        .map(normalizePermission)
        .filter(Boolean),
    ),
  ).filter((item) => ALL_PERMISSIONS.includes(item));

  if (normalized.length) return normalized;

  return Array.from(
    new Set(
      (Array.isArray(fallback) ? fallback : [])
        .map(normalizePermission)
        .filter(Boolean),
    ),
  ).filter((item) => ALL_PERMISSIONS.includes(item));
}

// ─── Image helpers ─────────────────────────────────────────────────────────────

function sanitizeImagePath(raw) {
  if (!raw) return null;
  const stripped = String(raw)
    .trim()
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/+/, "")
    .replace(/^image\//i, "");
  if (!stripped) return null;
  const parts = stripped.split("/").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return null;
  if (!parts.every((p) => /^[a-zA-Z0-9._-]+$/.test(p))) return null;
  return parts.join("/");
}

function getImgUrl(raw) {
  const safePath = sanitizeImagePath(raw);
  if (!safePath) return null;
  const encoded = safePath.split("/").map(encodeURIComponent).join("/");
  return `${API_BASE}/image/${encoded}`;
}

function validateLogoFile(file) {
  if (!file) return { ok: true };
  if (!ALLOWED_LOGO_TYPES.has(file.type))
    return { ok: false, message: "Logo faqat PNG, JPG yoki WEBP formatida bo'lishi kerak" };
  if (file.size > MAX_LOGO_SIZE_BYTES)
    return { ok: false, message: "Logo hajmi 2MB dan katta bo'lmasligi kerak" };
  return { ok: true };
}

// ─── Text / phone helpers ──────────────────────────────────────────────────────

function initials(name = "") {
  return String(name).trim().split(/\s+/).slice(0, 2)
    .map((w) => w[0] ?? "").join("").toUpperCase();
}

function cleanPhone(phone = "") {
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 9) return `+998${digits}`;
  if (digits.length === 10 && digits.startsWith("8")) return `+998${digits.slice(1)}`;
  if (digits.length >= 12 && digits.startsWith("998")) return `+${digits.slice(0, 12)}`;
  if (digits.length > 9) return `+998${digits.slice(-9)}`;
  return `+${digits}`;
}

function isValidUzPhone(phone = "") {
  return /^\+998\d{9}$/.test(cleanPhone(phone));
}

function toTelHref(phone = "") {
  const n = cleanPhone(phone);
  if (!/^\+\d{7,15}$/.test(n)) return null;
  return `tel:${n}`;
}

function sanitizeText(value, max = 120) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ").trim().slice(0, max);
}

function sanitizeDescription(value, max = 600) {
  return String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim().slice(0, max);
}

function sanitizeEmail(value) {
  return String(value || "").trim().toLowerCase().slice(0, 254);
}

// ─── Status helpers ────────────────────────────────────────────────────────────

function getCompanyStatus(company, fallback = false) {
  const raw =
    company?.status ?? company?.isActive ?? company?.active ??
    company?.enabled ?? company?.state;
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw === 1;
  if (typeof raw === "string") {
    const v = raw.trim().toLowerCase();
    if (["true", "1", "active", "enabled", "on"].includes(v)) return true;
    if (["false", "0", "inactive", "disabled", "off"].includes(v)) return false;
  }
  return fallback;
}

// ─── API layer ─────────────────────────────────────────────────────────────────

function toAbsoluteUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

function redirectToLogin() {
  localStorage.clear();
  window.location.href = "/login";
}

// Autentifikatsiya talab qiladigan so'rovlar uchun
async function apiFetch(path, options = {}) {
  const token = getAccessToken();
  if (!token) { redirectToLogin(); return null; }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const response = await fetch(toAbsoluteUrl(path), { ...options, headers });
  if (response.status === 401) { redirectToLogin(); return null; }
  return response;
}

// /company/public — token talab qilmaydi, faqat JSON
async function apiPublicPost(path, body) {
  const response = await fetch(toAbsoluteUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  return response;
}

async function readJsonSafely(response) {
  if (!response) return null;
  try { return await response.json(); } catch { return null; }
}

function stringifyApiPayload(payload) {
  if (!payload) return "";
  try { return JSON.stringify(payload, null, 2); } catch { return String(payload); }
}

function flattenValidationMessages(input) {
  if (!input) return [];
  if (typeof input === "string") return input.trim() ? [input.trim()] : [];
  if (Array.isArray(input)) return input.flatMap(flattenValidationMessages);
  if (typeof input === "object") {
    const messages = [];
    if (input.property && input.constraints && typeof input.constraints === "object") {
      messages.push(
        ...Object.values(input.constraints)
          .map((v) => String(v || "").trim())
          .filter(Boolean)
          .map((m) => `${input.property}: ${m}`),
      );
    }
    if (input.message) messages.push(...flattenValidationMessages(input.message));
    if (Array.isArray(input.errors)) messages.push(...flattenValidationMessages(input.errors));
    if (Array.isArray(input.children)) messages.push(...flattenValidationMessages(input.children));
    return messages;
  }
  return [];
}

function resolveErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  const flat = flattenValidationMessages(payload?.message);
  if (flat.length) return flat.join(", ");
  if (typeof payload?.message === "string" && payload.message.trim()) return payload.message.trim();
  if (typeof payload?.error === "string" && payload.error.trim()) return payload.error.trim();
  return fallback;
}

async function parseApiResponse(response, fallbackMessage) {
  if (!response) throw new Error("Server bilan ulanishda xatolik");
  const payload = await readJsonSafely(response);
  if (!response.ok) {
    const error = new Error(resolveErrorMessage(payload, fallbackMessage));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

function extractCompanyId(payload) {
  const candidates = [
    payload?.id,
    payload?.data?.id,
    payload?.company?.id,
    payload?.result?.id,
  ];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

// PATCH uchun options — logo bo'lsa multipart, bo'lmasa JSON
function buildPatchOptions(payload, logoFile = null) {
  if (logoFile instanceof File) {
    const fd = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => fd.append(key, item));
        return;
      }
      if (value === undefined || value === null || value === "") return;
      fd.append(key, String(value));
    });
    fd.append("logo", logoFile);
    return { method: "PATCH", body: fd };
  }

  const compact = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && v !== "";
    }),
  );
  return { method: "PATCH", body: JSON.stringify(compact) };
}

// ─── Company API calls ─────────────────────────────────────────────────────────

/**
 * Yangi kompaniya yaratish — 3 qadam:
 * 1. POST /company/public  (JSON, 5 field: name, phoneNumber, email, password, permissions)
 * 2. PATCH /company/:id    (managerName, description, logo — best-effort)
 * 3. PATCH /company/status/:id  (faqat status=false bo'lsa)
 */
async function createCompany({
  name, phoneNumber, email, password, permissions,
  managerName, description, logoFile, status,
}) {
  // 1. Asosiy yaratish
  const publicPayload = { name, phoneNumber, email, password, permissions };
  const createRes = await apiPublicPost("/company/public", publicPayload);

  let responsePayload;
  try {
    responsePayload = await parseApiResponse(createRes, "Kompaniyani yaratib bo'lmadi");
  } catch (error) {
    console.error("POST /company/public failed", {
      requestBody: publicPayload,
      status: error?.status ?? createRes?.status ?? null,
      responseBody: error?.payload ?? null,
      responseBodyText: stringifyApiPayload(error?.payload ?? null),
    });
    throw error;
  }

  const companyId = extractCompanyId(responsePayload);
  if (!companyId) {
    console.warn("Company created but ID not found in response", responsePayload);
    return responsePayload;
  }

  // 2. Qo'shimcha ma'lumotlar (best-effort)
  const hasExtra = Boolean(managerName) || Boolean(description) || logoFile instanceof File;
  if (hasExtra) {
    try {
      const detailsPayload = { name, phoneNumber, permissions };
      if (managerName) detailsPayload.managerName = managerName;
      if (description) detailsPayload.description = description;

      const patchRes = await apiFetch(
        `/company/${companyId}`,
        buildPatchOptions(detailsPayload, logoFile instanceof File ? logoFile : null),
      );
      await parseApiResponse(patchRes, "Qo'shimcha ma'lumotlarni saqlashda xatolik");
    } catch (detailsError) {
      console.warn("Company extra details update failed (best-effort):", detailsError);
    }
  }

  // 3. Status (default=true, faqat false bo'lsa o'zgartir)
  if (status === false) {
    try {
      const statusRes = await apiFetch(`/company/status/${companyId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: false, isActive: false, active: false }),
      });
      await parseApiResponse(statusRes, "Statusni yangilashda xatolik");
    } catch (statusError) {
      console.warn("Company status update failed (best-effort):", statusError);
    }
  }

  return responsePayload;
}

/**
 * Kompaniyani tahrirlash — 2 qadam:
 * 1. PATCH /company/:id    (details + logo)
 * 2. PATCH /company/status/:id  (faqat status o'zgargan bo'lsa)
 */
async function updateCompany({
  companyId, name, phoneNumber, permissions,
  managerName, description, logoFile, status, previousStatus,
}) {
  const detailsPayload = { name, phoneNumber, permissions };
  if (managerName) detailsPayload.managerName = managerName;
  if (description) detailsPayload.description = description;

  const patchRes = await apiFetch(
    `/company/${companyId}`,
    buildPatchOptions(detailsPayload, logoFile instanceof File ? logoFile : null),
  );

  try {
    await parseApiResponse(patchRes, "So'rovni bajarib bo'lmadi");
  } catch (error) {
    console.error("PATCH /company/:id failed", {
      companyId,
      requestBody: detailsPayload,
      status: error?.status ?? patchRes?.status ?? null,
      responseBody: error?.payload ?? null,
    });
    throw error;
  }

  // Status o'zgargan bo'lsa
  if (status !== previousStatus) {
    try {
      const statusRes = await apiFetch(`/company/status/${companyId}`, {
        method: "PATCH",
        body: JSON.stringify({ status, isActive: status, active: status }),
      });
      await parseApiResponse(statusRes, "Statusni yangilashda xatolik");
    } catch (statusError) {
      console.warn("Status update failed:", statusError);
      toast.warning("Kompaniya yangilandi, lekin status o'zgartirilmadi");
    }
  }
}

// ─── Drawer ────────────────────────────────────────────────────────────────────

function getInitialForm(company) {
  return {
    name: sanitizeText(company?.name || "", 120),
    managerName: sanitizeText(company?.managerName || "", 120),
    phoneNumber: cleanPhone(company?.phoneNumber || ""),
    email: "",
    password: "",
    description: sanitizeDescription(company?.description || "", 600),
    permissions: normalizePermissions(company?.permissions, { fallback: ["CRM"] }),
    status: getCompanyStatus(company, true),
    logo: null,
  };
}

// ─── List helpers ──────────────────────────────────────────────────────────────

function extractCompanies(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.companies)) return payload.companies;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function extractTotal(payload, fallback) {
  const candidates = [
    payload?.total, payload?.count,
    payload?.pagination?.total, payload?.meta?.total, payload?.data?.total,
  ];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return fallback;
}

function buildPageNumbers(totalPages, page) {
  return Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
    .reduce((acc, n, i, arr) => {
      if (i > 0 && n - arr[i - 1] > 1) acc.push("...");
      acc.push(n);
      return acc;
    }, []);
}

// ─── Main content ──────────────────────────────────────────────────────────────

function CompaniesContent() {
  const role = getCurrentRole();
  const canDeleteCompanies = canDeleteData(role);
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const superadminCompanyId = useMemo(() => getSuperadminCompanyId(), []);

  const fetchCompanies = useCallback(
    async ({ pageToLoad = page, signal } = {}) => {
      setLoading(true);
      try {
        const response = await apiFetch(
          `/company/all?limit=${PER_PAGE}&page=${pageToLoad}`,
          { signal },
        );
        const payload = await parseApiResponse(response, "Kompaniyalar yuklanmadi");

        const rawList = extractCompanies(payload);
        const visibleList = rawList
          .filter((c) => !superadminCompanyId || String(c?.id) !== String(superadminCompanyId))
          .map((c) => ({
            ...c,
            permissions: normalizePermissions(c?.permissions),
            status: getCompanyStatus(c, false),
            isActive: getCompanyStatus(c, false),
          }));

        const hiddenCount = rawList.length - visibleList.length;
        const resolvedTotal = Math.max(0, extractTotal(payload, visibleList.length) - hiddenCount);

        setCompanies(visibleList);
        setTotal(resolvedTotal);
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error(error);
        toast.error(error?.message || "Kompaniyalar yuklanmadi");
      } finally {
        setLoading(false);
      }
    },
    [page, superadminCompanyId],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchCompanies({ pageToLoad: page, signal: controller.signal });
    return () => controller.abort();
  }, [page, fetchCompanies]);

  useEffect(() => {
    if (!selectedCompany?.id) return;
    const updated = companies.find((item) => String(item?.id) === String(selectedCompany.id));
    if (updated) setSelectedCompany(updated);
  }, [companies, selectedCompany?.id]);

  const normalizedQuery = search.trim().toLowerCase();

  const filteredCompanies = useMemo(() => {
    if (!normalizedQuery) return companies;
    return companies.filter((c) =>
      [c?.name, c?.managerName, c?.phoneNumber]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(normalizedQuery)),
    );
  }, [companies, normalizedQuery]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const pageNumbers = useMemo(() => buildPageNumbers(totalPages, page), [totalPages, page]);

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    if (!canDeleteCompanies) {
      toast.error("Sizda kompaniyani o'chirish uchun ruxsat yo'q");
      setDeleteTarget(null);
      return;
    }
    if (superadminCompanyId && String(deleteTarget.id) === String(superadminCompanyId)) {
      toast.error("O'zingizning kompaniyangizni o'chirish mumkin emas");
      setDeleteTarget(null);
      return;
    }

    setDeleting(true);
    try {
      const response = await apiFetch(`/company/delete/${deleteTarget.id}`, { method: "DELETE" });
      await parseApiResponse(response, "Kompaniyani o'chirishda xatolik");
      toast.success("Kompaniya o'chirildi");
      if (selectedCompany?.id === deleteTarget.id) setSelectedCompany(null);
      const shouldGoPrev = page > 1 && companies.length <= 1;
      if (shouldGoPrev) setPage((prev) => prev - 1);
      else await fetchCompanies({ pageToLoad: page });
    } catch (error) {
      toast.error(error?.message || "O'chirishda xatolik");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#071828] font-[Segoe_UI,sans-serif]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.015]" />

      <div className="sticky top-0 z-10 animate-in fade-in slide-in-from-top-2 border-b border-white/[0.06] bg-[#071828]/90 px-6 py-4 backdrop-blur duration-300">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white">Kompaniyalar</h1>
            <p className="mt-0.5 text-xs text-gray-600">
              {loading ? "Yuklanmoqda..." : `${total} ta kompaniya`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search size={13} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-600" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Qidirish..." maxLength={120}
                className="w-48 rounded-xl border border-white/[0.07] bg-[#0a1929] py-2 pr-3 pl-8 text-sm text-white transition-all outline-none placeholder:text-gray-600 focus:border-[#3b82f6]" />
            </div>
            <button type="button" onClick={() => setDrawer("add")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(37,99,235,0.3)] transition-all hover:opacity-90 active:scale-95">
              <Plus size={16} />
              <span className="hidden sm:inline">Yangi kompaniya</span>
              <span className="sm:hidden">Yangi</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={`sk-${i}`} />)}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="flex animate-in fade-in slide-in-from-bottom-3 flex-col items-center justify-center gap-4 py-24 text-center duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <Building2 size={28} className="text-gray-700" />
            </div>
            <p className="text-base font-semibold text-white">
              {normalizedQuery ? "Hech narsa topilmadi" : "Hech qanday kompaniya yo'q"}
            </p>
            <p className="text-sm text-gray-600">
              {normalizedQuery ? "Boshqa so'z bilan qidiring" : "Birinchi kompaniyangizni qo'shing"}
            </p>
            {!normalizedQuery ? (
              <button type="button" onClick={() => setDrawer("add")}
                className="mt-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white">
                <Plus size={15} /> Kompaniya qo'shish
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCompanies.map((company) => (
                <CompanyCard key={company.id} company={company}
                  onView={(item) => setSelectedCompany(item)}
                  onEdit={(item) => { setSelectedCompany(null); setDrawer(item); }}
                  onDelete={(item) => setDeleteTarget(item)}
                  lockDelete={!canDeleteCompanies}
                  getImgUrl={getImgUrl}
                  initials={initials}
                  toTelHref={toTelHref}
                  getCompanyStatus={getCompanyStatus}
                  permissionLabel={permissionLabel} />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
                <div className="mx-auto flex max-w-6xl items-center justify-center gap-2">
                  <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-gray-400 transition-colors hover:text-white disabled:opacity-30">
                    <ChevronLeft size={16} />
                  </button>
                  {pageNumbers.map((item, index) =>
                    item === "..." ? (
                      <span key={`dots-${index}`} className="text-sm text-gray-600">...</span>
                    ) : (
                      <button key={`page-${item}`} type="button" onClick={() => setPage(item)}
                        className={`h-9 min-w-[36px] rounded-xl border px-3 text-sm font-medium transition-all ${
                          item === page
                            ? "border-blue-600 bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] text-white"
                            : "border-white/[0.08] text-gray-400"
                        }`}>
                        {item}
                      </button>
                    ),
                  )}
                  <button type="button"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-gray-400 transition-colors hover:text-white disabled:opacity-30">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      {drawer ? (
        <CompanyDrawer
          company={drawer === "add" ? null : drawer}
          onClose={() => setDrawer(null)}
          onSaved={() => fetchCompanies({ pageToLoad: page })}
          getInitialForm={getInitialForm}
          getImgUrl={getImgUrl}
          validateLogoFile={validateLogoFile}
          sanitizeText={sanitizeText}
          sanitizeDescription={sanitizeDescription}
          cleanPhone={cleanPhone}
          sanitizeEmail={sanitizeEmail}
          normalizePermissions={normalizePermissions}
          isValidUzPhone={isValidUzPhone}
          permissionLabel={permissionLabel}
          ALL_PERMISSIONS={ALL_PERMISSIONS}
          getCompanyStatus={getCompanyStatus}
          updateCompany={updateCompany}
          createCompany={createCompany}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog company={deleteTarget} onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)} deleting={deleting} />
      ) : null}

      {selectedCompany ? (
        <CompanyDetailModal company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onEdit={(item) => { setSelectedCompany(null); setDrawer(item); }}
          getImgUrl={getImgUrl}
          initials={initials}
          toTelHref={toTelHref}
          getCompanyStatus={getCompanyStatus}
          permissionLabel={permissionLabel} />
      ) : null}
    </div>
  );
}

// ─── Page guard ────────────────────────────────────────────────────────────────

export default function CompaniesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = getCurrentRole();
    if (!isSuperAdminLikeRole(role)) navigate("/403", { replace: true });
  }, [navigate]);

  const role = getCurrentRole();
  if (!isSuperAdminLikeRole(role)) return null;

  return <CompaniesContent />;
}
