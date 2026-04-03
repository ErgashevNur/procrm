import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Loader2,
  Building2,
  Hash,
  Check,
  AlertTriangle,
  Phone,
  Briefcase,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  canDeleteData,
  getCurrentRole,
  isSuperAdminLikeRole,
} from "@/lib/rbac";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_VITE_API_KEY_PROHOME.replace(/\/+$/, "");
const PER_PAGE = 10;
const ALL_PERMISSIONS = ["CRM", "Prohome"];
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

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

function normalizePermission(permission) {
  const value = String(permission || "")
    .trim()
    .toUpperCase();
  if (value === "CRM") return "CRM";
  if (value === "PROHOME") return "Prohome";
  return "";
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

function sanitizeImagePath(raw) {
  if (!raw) return null;

  const stripped = String(raw)
    .trim()
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/+/, "")
    .replace(/^image\//i, "");

  if (!stripped) return null;

  const parts = stripped
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) return null;

  const isSafe = parts.every((part) => /^[a-zA-Z0-9._-]+$/.test(part));
  if (!isSafe) return null;

  return parts.join("/");
}

function getImgUrl(raw) {
  const safePath = sanitizeImagePath(raw);
  if (!safePath) return null;

  const encodedPath = safePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${API_BASE}/image/${encodedPath}`;
}

function initials(name = "") {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
}

function cleanPhone(phone = "") {
  const digits = String(phone).replace(/\D/g, "");

  if (!digits) return "";
  if (digits.length === 9) return `+998${digits}`;
  if (digits.length === 10 && digits.startsWith("8")) {
    return `+998${digits.slice(1)}`;
  }
  if (digits.length >= 12 && digits.startsWith("998")) {
    return `+${digits.slice(0, 12)}`;
  }
  if (digits.length > 9) {
    return `+998${digits.slice(-9)}`;
  }

  return `+${digits}`;
}

function isValidUzPhone(phone = "") {
  return /^\+998\d{9}$/.test(cleanPhone(phone));
}

function toTelHref(phone = "") {
  const normalized = cleanPhone(phone);
  if (!/^\+\d{7,15}$/.test(normalized)) return null;
  return `tel:${normalized}`;
}

function sanitizeText(value, max = 120) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function sanitizeDescription(value, max = 600) {
  return String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

function validateLogoFile(file) {
  if (!file) return { ok: true };

  if (!ALLOWED_LOGO_TYPES.has(file.type)) {
    return {
      ok: false,
      message: "Logo faqat PNG, JPG yoki WEBP formatida bo'lishi kerak",
    };
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return {
      ok: false,
      message: "Logo hajmi 2MB dan katta bo'lmasligi kerak",
    };
  }

  return { ok: true };
}

function getCompanyStatus(company, fallback = false) {
  const raw =
    company?.status ??
    company?.isActive ??
    company?.active ??
    company?.enabled ??
    company?.state;

  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw === 1;

  if (typeof raw === "string") {
    const value = raw.trim().toLowerCase();
    if (["true", "1", "active", "enabled", "on"].includes(value)) return true;
    if (["false", "0", "inactive", "disabled", "off"].includes(value))
      return false;
  }

  return fallback;
}

function toAbsoluteUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${API_BASE}${path}`;
  return `${API_BASE}/${path}`;
}

function redirectToLogin() {
  localStorage.clear();
  window.location.href = "/login";
}

async function apiFetch(path, options = {}) {
  const token = getAccessToken();
  if (!token) {
    redirectToLogin();
    return null;
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await fetch(toAbsoluteUrl(path), {
    ...options,
    headers,
  });

  if (response.status === 401) {
    redirectToLogin();
    return null;
  }

  return response;
}

async function readJsonSafely(response) {
  if (!response) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function resolveErrorMessage(payload, fallbackMessage) {
  if (!payload) return fallbackMessage;

  if (Array.isArray(payload?.message)) {
    return payload.message.filter(Boolean).join(", ") || fallbackMessage;
  }

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }

  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error.trim();
  }

  return fallbackMessage;
}

async function parseApiResponse(response, fallbackMessage) {
  if (!response) {
    throw new Error("Server bilan ulanishda xatolik");
  }

  const payload = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(resolveErrorMessage(payload, fallbackMessage));
  }

  return payload;
}

function FormField({ label, required = false, icon: Icon, error, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium tracking-wider text-gray-500 uppercase">
        {Icon ? <Icon size={11} className="text-gray-600" /> : null}
        {label} {required ? <span className="text-red-400">*</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1 text-[11px] text-red-400">{error}</p> : null}
    </div>
  );
}

function TInput({
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  ...rest
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      {...rest}
      className="w-full rounded-xl border border-white/[0.07] bg-[#0a1929] px-3 py-2.5 text-sm text-white transition-all outline-none placeholder:text-gray-600 focus:border-[#3b82f6]"
    />
  );
}

function ImageDropZone({ fileName, preview, onChange, error }) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    onChange(file);
  };

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium tracking-wider text-gray-500 uppercase">
        Logo
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
        className="relative flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all"
        style={{
          borderColor: isDragOver
            ? "#3b82f6"
            : preview
              ? "#3b82f640"
              : "rgba(255,255,255,0.08)",
          background: isDragOver
            ? "rgba(59,130,246,0.06)"
            : preview
              ? "rgba(59,130,246,0.03)"
              : "rgba(255,255,255,0.02)",
        }}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Logo preview"
              className="h-full w-full rounded-xl object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <p className="text-xs font-medium text-white">O'zgartirish</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
              <Upload size={16} className="text-gray-500" />
            </div>
            <p className="text-xs text-gray-600">Logo yuklang yoki tashlang</p>
            <p className="text-[10px] text-gray-700">PNG, JPG, WEBP (2MB)</p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </div>

      {fileName ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-green-400">
          <Check size={11} /> {fileName}
        </p>
      ) : null}
      {error ? <p className="mt-1 text-[11px] text-red-400">{error}</p> : null}
    </div>
  );
}

function ConfirmDialog({ company, onConfirm, onCancel, deleting = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0f2030] p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Kompaniyani o'chirish
            </p>
            <p className="text-xs text-gray-500">
              Bu amalni qaytarib bo'lmaydi
            </p>
          </div>
        </div>

        <p className="mb-5 text-sm text-gray-400">
          <span className="font-semibold text-white">
            &quot;{company?.name || "Noma'lum"}&quot;
          </span>{" "}
          kompaniyasini o'chirmoqchimisiz?
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-xl border border-white/[0.08] py-2 text-sm font-medium text-gray-400 transition-colors hover:text-white disabled:opacity-50"
          >
            Bekor
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "O'chirish"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.04] bg-[#0f2438]">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-2/3 rounded-lg" />
        <Skeleton className="h-3 w-1/2 rounded-lg" />
        <Skeleton className="mt-3 h-6 w-32 rounded-lg" />
      </div>
    </div>
  );
}

function CompanyCard({
  company,
  index,
  onEdit,
  onDelete,
  onView,
  lockDelete = false,
}) {
  const [imageError, setImageError] = useState(false);

  const logoUrl = useMemo(() => getImgUrl(company?.logo), [company?.logo]);
  const showLogo = Boolean(logoUrl && !imageError);
  const telHref = toTelHref(company?.phoneNumber);
  const isActive = getCompanyStatus(company, false);

  return (
    <div
      onClick={() => onView(company)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/6 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/12"
      style={{
        background: "linear-gradient(145deg,#0f2438 0%,#0a1929 100%)",
        animation: `fadeUp .4s ease ${index * 0.05}s both`,
      }}
    >
      <div className="relative h-36 w-full overflow-hidden bg-[#0a1929]">
        {showLogo ? (
          <img
            src={logoUrl}
            alt={company?.name || "Company logo"}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-blue-300"
              style={{
                background: "rgba(37,99,235,0.15)",
                border: "1px solid rgba(37,99,235,0.2)",
              }}
            >
              {initials(company?.name || "")}
            </div>
          </div>
        )}

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(7,24,40,0.95) 0%, transparent 55%)",
          }}
        />

        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#071828]/80 px-2 py-0.5 backdrop-blur-sm">
            <Hash size={9} className="text-blue-400" />
            <span className="text-[10px] font-bold text-white">
              {company?.id}
            </span>
          </div>
        </div>

        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onView(company);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.12] bg-[#071828]/80 text-gray-400 backdrop-blur-sm transition-colors hover:text-white"
            aria-label="Ko'rish"
          >
            <Eye size={12} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(company);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.12] bg-[#071828]/80 text-gray-400 backdrop-blur-sm transition-colors hover:text-blue-400"
            aria-label="Tahrirlash"
          >
            <Pencil size={12} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (!lockDelete) onDelete(company);
            }}
            disabled={lockDelete}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.12] bg-[#071828]/80 text-gray-400 backdrop-blur-sm transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="O'chirish"
          >
            <Trash2 size={12} />
          </button>
        </div>

        <div className="absolute right-3 bottom-3 left-3">
          <p className="truncate text-sm font-semibold text-white">
            {company?.name}
          </p>
          {company?.managerName ? (
            <p className="truncate text-[11px] text-gray-300">
              {company.managerName}
            </p>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        {company?.description ? (
          <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-gray-700">
            {company.description}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          {telHref ? (
            <a
              href={telHref}
              onClick={(event) => event.stopPropagation()}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.04] bg-white/[0.02] px-2.5 py-1 transition-colors hover:border-green-500/20 hover:bg-green-500/5"
            >
              <Phone size={9} className="text-green-400" />
              <span className="text-[10px] text-gray-500">
                {company.phoneNumber}
              </span>
            </a>
          ) : null}

          {company?.permissions?.length ? (
            <div className="flex flex-wrap gap-1">
              {company.permissions.map((permission) => (
                <span
                  key={`${company.id}-${permission}`}
                  className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    background: "rgba(37,99,235,0.12)",
                    color: "#93c5fd",
                    border: "1px solid rgba(37,99,235,0.2)",
                  }}
                >
                  {permission}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div
          onClick={(event) => event.stopPropagation()}
          className="mt-3 flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2"
        >
          <span
            className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-400" : "bg-gray-500"}`}
          />
          <span
            className={`text-[11px] font-medium ${isActive ? "text-emerald-300" : "text-gray-400"}`}
          >
            {isActive ? "Aktiv" : "Nofaol"}
          </span>
        </div>
      </div>
    </div>
  );
}

function CompanyDetailModal({ company, onClose, onEdit }) {
  const [imageError, setImageError] = useState(false);

  const logoUrl = useMemo(() => getImgUrl(company?.logo), [company?.logo]);
  const showLogo = Boolean(logoUrl && !imageError);
  const telHref = toTelHref(company?.phoneNumber);
  const isActive = getCompanyStatus(company, false);

  if (!company) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(5px)" }}
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/[0.08] shadow-2xl"
        style={{
          background: "linear-gradient(145deg,#0f2438 0%,#071828 100%)",
          animation: "modalFade .25s ease",
        }}
      >
        <div className="relative h-64 w-full overflow-hidden bg-[#0a1929]">
          {showLogo ? (
            <img
              src={logoUrl}
              alt={company?.name || "Company logo"}
              onError={() => setImageError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-3xl font-bold text-blue-300"
                style={{
                  background: "rgba(37,99,235,0.15)",
                  border: "1px solid rgba(37,99,235,0.2)",
                }}
              >
                {initials(company?.name || "")}
              </div>
            </div>
          )}

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(7,24,40,0.98) 0%, rgba(7,24,40,0.4) 40%, transparent 100%)",
            }}
          />

          <div className="absolute top-5 left-5 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#071828]/80 px-2.5 py-1 backdrop-blur-sm">
              <Hash size={10} className="text-blue-400" />
              <span className="text-xs font-bold text-white">{company.id}</span>
            </div>

            {company?.permissions?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {company.permissions.map((permission) => (
                  <span
                    key={`${company.id}-${permission}`}
                    className="rounded-lg border border-blue-400/20 bg-blue-500/15 px-2 py-1 text-[10px] font-semibold text-blue-200"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="absolute top-5 right-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(company)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#071828]/80 text-gray-300 backdrop-blur-sm transition-colors hover:text-blue-400"
              aria-label="Tahrirlash"
            >
              <Pencil size={15} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#071828]/80 text-gray-300 backdrop-blur-sm transition-colors hover:text-white"
              aria-label="Yopish"
            >
              <X size={16} />
            </button>
          </div>

          <div className="absolute right-5 bottom-5 left-5">
            <h2 className="text-2xl font-bold text-white">
              {company?.name || "Noma'lum kompaniya"}
            </h2>
            <p className="mt-1 text-sm text-gray-300">
              {company?.managerName || "Manager ko'rsatilmagan"}
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              <p className="text-sm font-semibold text-white">
                Asosiy ma'lumotlar
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Kompaniya nomi</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {company?.name || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Manager</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {company?.managerName || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Telefon</p>
                {telHref ? (
                  <a
                    href={telHref}
                    className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-green-400 hover:text-green-300"
                  >
                    <Phone size={14} />
                    {company.phoneNumber}
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-medium text-white">-</p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500">ID</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {company?.id}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-gray-500"}`}
                  />
                  <p
                    className={`text-xs font-semibold ${isActive ? "text-emerald-300" : "text-gray-400"}`}
                  >
                    {isActive ? "Aktiv" : "Nofaol"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-400" />
              <p className="text-sm font-semibold text-white">
                Qo'shimcha ma'lumot
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Tavsif</p>
                <p className="mt-1 text-sm leading-6 text-white">
                  {company?.description || "Tavsif mavjud emas"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Ruxsatlar</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {company?.permissions?.length ? (
                    company.permissions.map((permission) => (
                      <span
                        key={`p-${company.id}-${permission}`}
                        className="rounded-lg border border-blue-400/20 bg-blue-500/12 px-2.5 py-1 text-xs font-medium text-blue-300"
                      >
                        {permission}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">
                      Ruxsatlar mavjud emas
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
          >
            Yopish
          </button>

          <button
            type="button"
            onClick={() => onEdit(company)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white"
          >
            <Pencil size={14} /> Tahrirlash
          </button>
        </div>
      </div>

      <style>{`@keyframes modalFade { from { opacity:0; transform:scale(0.96) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

function getInitialForm(company) {
  return {
    name: sanitizeText(company?.name || "", 120),
    managerName: sanitizeText(company?.managerName || "", 120),
    phoneNumber: cleanPhone(company?.phoneNumber || ""),
    description: sanitizeDescription(company?.description || "", 600),
    permissions: normalizePermissions(company?.permissions, {
      fallback: ["CRM"],
    }),
    status: getCompanyStatus(company, true),
    logo: null,
  };
}

function CompanyDrawer({ company, onClose, onSaved }) {
  const isEdit = Boolean(company);

  const [form, setForm] = useState(() => getInitialForm(company));
  const [preview, setPreview] = useState(() =>
    company?.logo ? getImgUrl(company.logo) : null,
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const objectUrlRef = useRef(null);

  useEffect(() => {
    setForm(getInitialForm(company));
    setPreview(company?.logo ? getImgUrl(company.logo) : null);
    setErrors({});
  }, [company]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const setField = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const togglePermission = (permission) => {
    setForm((prev) => {
      const next = prev.permissions.includes(permission)
        ? prev.permissions.filter((item) => item !== permission)
        : [...prev.permissions, permission];

      return {
        ...prev,
        permissions: normalizePermissions(next),
      };
    });
  };

  const handleImage = (file) => {
    const validation = validateLogoFile(file);
    if (!validation.ok) {
      setErrors((prev) => ({ ...prev, logo: validation.message }));
      toast.error(validation.message);
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    setErrors((prev) => ({ ...prev, logo: undefined }));
    setForm((prev) => ({ ...prev, logo: file }));
    setPreview(objectUrl);
  };

  const validate = () => {
    const nextErrors = {};

    const name = sanitizeText(form.name, 120);
    const managerName = sanitizeText(form.managerName, 120);
    const description = sanitizeDescription(form.description, 600);
    const phoneNumber = cleanPhone(form.phoneNumber);
    const permissions = normalizePermissions(form.permissions);

    if (!name) {
      nextErrors.name = "Nom majburiy";
    }

    if (!managerName) {
      nextErrors.managerName = "Menejer ismi majburiy";
    }

    if (!phoneNumber) {
      nextErrors.phoneNumber = "Telefon majburiy";
    } else if (!isValidUzPhone(phoneNumber)) {
      nextErrors.phoneNumber =
        "Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak";
    }

    if (description.length > 600) {
      nextErrors.description = "Tavsif 600 belgidan oshmasligi kerak";
    }

    if (!permissions.length) {
      nextErrors.permissions = "Kamida bitta ruxsat tanlanishi kerak";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return null;
    }

    return {
      name,
      managerName,
      description,
      phoneNumber,
      permissions,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalized = validate();
    if (!normalized || submitting) return;
    const nextStatus = Boolean(form.status);
    const previousStatus = getCompanyStatus(company, true);

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", normalized.name);
      formData.append("managerName", normalized.managerName);
      formData.append("phoneNumber", normalized.phoneNumber);
      formData.append("description", normalized.description);
      formData.append("status", String(nextStatus));

      normalized.permissions.forEach((permission) => {
        formData.append("permissions", permission);
      });

      if (form.logo instanceof File) {
        formData.append("logo", form.logo);
      }

      const endpoint = isEdit ? `/company/${company.id}` : "/company";
      const method = isEdit ? "PATCH" : "POST";

      const response = await apiFetch(endpoint, {
        method,
        body: formData,
      });

      await parseApiResponse(response, "So'rovni bajarib bo'lmadi");

      if (isEdit && nextStatus !== previousStatus) {
        const statusResponse = await apiFetch(`/company/status/${company.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            status: nextStatus,
            isActive: nextStatus,
            active: nextStatus,
          }),
        });
        await parseApiResponse(statusResponse, "Statusni yangilashda xatolik");
      }

      toast.success(isEdit ? "Kompaniya yangilandi" : "Kompaniya qo'shildi");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error?.message || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative flex h-full w-full max-w-md flex-col border-l border-white/6 bg-[#071828] shadow-2xl"
        style={{ animation: "slideIn .25s ease" }}
      >
        <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              {isEdit ? "Kompaniyani tahrirlash" : "Yangi kompaniya"}
            </h2>
            <p className="mt-0.5 text-xs text-gray-600">
              {isEdit ? `#${company.id}` : "Ma'lumotlarni to'ldiring"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] text-gray-500 transition-colors hover:text-white"
            aria-label="Yopish"
          >
            <X size={15} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <FormField
              label="Nomi"
              required
              icon={Building2}
              error={errors.name}
            >
              <TInput
                value={form.name}
                onChange={setField("name")}
                placeholder="Kompaniya nomi"
                maxLength={120}
              />
            </FormField>

            <FormField
              label="Menejer ismi"
              required
              icon={Users}
              error={errors.managerName}
            >
              <TInput
                value={form.managerName}
                onChange={setField("managerName")}
                placeholder="To'liq ism sharif"
                maxLength={120}
              />
            </FormField>

            <FormField
              label="Telefon raqam"
              required
              icon={Phone}
              error={errors.phoneNumber}
            >
              <TInput
                value={form.phoneNumber}
                onChange={setField("phoneNumber")}
                placeholder="+998 90 000 00 00"
                type="tel"
                maxLength={17}
              />
            </FormField>

            <FormField
              label="Tavsif"
              icon={Briefcase}
              error={errors.description}
            >
              <textarea
                value={form.description}
                onChange={(event) =>
                  setField("description")(event.target.value)
                }
                placeholder="Kompaniya haqida qisqacha..."
                rows={3}
                maxLength={600}
                className="w-full resize-none rounded-xl border border-white/[0.07] bg-[#0a1929] px-3 py-2.5 text-sm text-white transition-all outline-none placeholder:text-gray-600 focus:border-[#3b82f6]"
              />
            </FormField>

            <div>
              <p className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase">
                Ruxsatlar
              </p>

              <div className="flex flex-wrap gap-2">
                {ALL_PERMISSIONS.map((permission) => {
                  const isActive = form.permissions.includes(permission);

                  return (
                    <button
                      key={permission}
                      type="button"
                      onClick={() => togglePermission(permission)}
                      className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all"
                      style={{
                        background: isActive
                          ? "rgba(37,99,235,0.15)"
                          : "transparent",
                        borderColor: isActive
                          ? "rgba(37,99,235,0.4)"
                          : "rgba(255,255,255,0.1)",
                        color: isActive ? "#93c5fd" : "#6b7280",
                      }}
                    >
                      <div
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full border"
                        style={{
                          borderColor: isActive ? "#3b82f6" : "#6b7280",
                          background: isActive ? "#3b82f6" : "transparent",
                        }}
                      >
                        {isActive ? (
                          <Check size={9} className="text-white" />
                        ) : null}
                      </div>
                      {permission}
                    </button>
                  );
                })}
              </div>

              {errors.permissions ? (
                <p className="mt-1 text-[11px] text-red-400">
                  {errors.permissions}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#0a1929] px-3 py-2.5">
              <div>
                <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Status
                </p>
                <p
                  className={`mt-1 text-xs font-semibold ${form.status ? "text-emerald-300" : "text-gray-400"}`}
                >
                  {form.status ? "Aktiv" : "Nofaol"}
                </p>
              </div>
              <Switch
                checked={Boolean(form.status)}
                onCheckedChange={(checked) => setField("status")(checked)}
              />
            </div>

            <ImageDropZone
              fileName={form.logo?.name}
              preview={preview}
              onChange={handleImage}
              error={errors.logo}
            />
          </div>

          <div className="flex gap-3 border-t border-white/[0.06] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              Bekor
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <Check size={15} /> {isEdit ? "Saqlash" : "Qo'shish"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
    payload?.total,
    payload?.count,
    payload?.pagination?.total,
    payload?.meta?.total,
    payload?.data?.total,
  ];

  for (const value of candidates) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) {
      return numeric;
    }
  }

  return fallback;
}

function buildPageNumbers(totalPages, page) {
  return Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter(
      (number) =>
        number === 1 || number === totalPages || Math.abs(number - page) <= 1,
    )
    .reduce((acc, number, index, arr) => {
      if (index > 0 && number - arr[index - 1] > 1) {
        acc.push("...");
      }

      acc.push(number);
      return acc;
    }, []);
}

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
        const payload = await parseApiResponse(
          response,
          "Kompaniyalar yuklanmadi",
        );

        const rawList = extractCompanies(payload);
        const visibleList = rawList
          .filter(
            (company) =>
              !superadminCompanyId ||
              String(company?.id) !== String(superadminCompanyId),
          )
          .map((company) => ({
            ...company,
            permissions: normalizePermissions(company?.permissions),
            status: getCompanyStatus(company, false),
            isActive: getCompanyStatus(company, false),
          }));

        const hiddenCount = rawList.length - visibleList.length;
        const resolvedTotal = Math.max(
          0,
          extractTotal(payload, visibleList.length) - hiddenCount,
        );

        setCompanies(visibleList);
        setTotal(resolvedTotal);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

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

    return () => {
      controller.abort();
    };
  }, [page, fetchCompanies]);

  useEffect(() => {
    if (!selectedCompany?.id) return;

    const updated = companies.find(
      (item) => String(item?.id) === String(selectedCompany.id),
    );

    if (updated) {
      setSelectedCompany(updated);
    }
  }, [companies, selectedCompany?.id]);

  const normalizedQuery = search.trim().toLowerCase();

  const filteredCompanies = useMemo(() => {
    if (!normalizedQuery) return companies;

    return companies.filter((company) => {
      return [company?.name, company?.managerName, company?.phoneNumber]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    });
  }, [companies, normalizedQuery]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const pageNumbers = useMemo(
    () => buildPageNumbers(totalPages, page),
    [totalPages, page],
  );

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    if (!canDeleteCompanies) {
      toast.error("Sizda kompaniyani o'chirish uchun ruxsat yo'q");
      setDeleteTarget(null);
      return;
    }

    const deletingOwnCompany =
      superadminCompanyId &&
      String(deleteTarget.id) === String(superadminCompanyId);

    if (deletingOwnCompany) {
      toast.error("O'zingizning kompaniyangizni o'chirish mumkin emas");
      setDeleteTarget(null);
      return;
    }

    setDeleting(true);

    try {
      const response = await apiFetch(`/company/delete/${deleteTarget.id}`, {
        method: "DELETE",
      });

      await parseApiResponse(response, "Kompaniyani o'chirishda xatolik");

      toast.success("Kompaniya o'chirildi");

      if (selectedCompany?.id === deleteTarget.id) {
        setSelectedCompany(null);
      }

      const shouldGoPrevPage = page > 1 && companies.length <= 1;
      if (shouldGoPrevPage) {
        setPage((prev) => prev - 1);
      } else {
        await fetchCompanies({ pageToLoad: page });
      }
    } catch (error) {
      toast.error(error?.message || "O'chirishda xatolik");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#071828]"
      style={{ fontFamily: "'Segoe UI', sans-serif" }}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div
        className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#071828]/90 px-6 py-4 backdrop-blur"
        style={{ animation: "fadeUp .3s ease both" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white">Kompaniyalar</h1>
            <p className="mt-0.5 text-xs text-gray-600">
              {loading ? "Yuklanmoqda..." : `${total} ta kompaniya`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search
                size={13}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-600"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Qidirish..."
                maxLength={120}
                className="w-48 rounded-xl border border-white/[0.07] bg-[#0a1929] py-2 pr-3 pl-8 text-sm text-white transition-all outline-none placeholder:text-gray-600 focus:border-[#3b82f6]"
              />
            </div>

            <button
              type="button"
              onClick={() => setDrawer("add")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(37,99,235,0.3)] transition-all hover:opacity-90 active:scale-95"
            >
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
            {Array.from({ length: 8 }).map((_, index) => (
              <CardSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-4 py-24 text-center"
            style={{ animation: "fadeUp .4s ease both" }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <Building2 size={28} className="text-gray-700" />
            </div>
            <p className="text-base font-semibold text-white">
              {normalizedQuery
                ? "Hech narsa topilmadi"
                : "Hech qanday kompaniya yo'q"}
            </p>
            <p className="text-sm text-gray-600">
              {normalizedQuery
                ? "Boshqa so'z bilan qidiring"
                : "Birinchi kompaniyangizni qo'shing"}
            </p>
            {!normalizedQuery ? (
              <button
                type="button"
                onClick={() => setDrawer("add")}
                className="mt-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={15} /> Kompaniya qo'shish
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCompanies.map((company, index) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  index={index}
                  onView={(item) => setSelectedCompany(item)}
                  onEdit={(item) => {
                    setSelectedCompany(null);
                    setDrawer(item);
                  }}
                  onDelete={(item) => setDeleteTarget(item)}
                  lockDelete={!canDeleteCompanies}
                />
              ))}
            </div>

            {totalPages > 1 ? (
              <div
                className="mt-8 flex items-center justify-center gap-2"
                style={{ animation: "fadeUp .4s ease both" }}
              >
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-gray-400 transition-colors hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>

                {pageNumbers.map((item, index) =>
                  item === "..." ? (
                    <span
                      key={`dots-${index}`}
                      className="text-sm text-gray-600"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${item}`}
                      type="button"
                      onClick={() => setPage(item)}
                      className="h-9 min-w-[36px] rounded-xl border px-3 text-sm font-medium transition-all"
                      style={
                        item === page
                          ? {
                              background:
                                "linear-gradient(135deg,#2563eb,#1d4ed8)",
                              borderColor: "#2563eb",
                              color: "#fff",
                            }
                          : {
                              borderColor: "rgba(255,255,255,0.08)",
                              color: "#9ca3af",
                            }
                      }
                    >
                      {item}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={page === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-gray-400 transition-colors hover:text-white disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
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
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          company={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      ) : null}

      {selectedCompany ? (
        <CompanyDetailModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onEdit={(item) => {
            setSelectedCompany(null);
            setDrawer(item);
          }}
        />
      ) : null}

      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

export default function CompaniesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = getCurrentRole();
    if (!isSuperAdminLikeRole(role)) {
      navigate("/403", { replace: true });
    }
  }, [navigate]);

  const role = getCurrentRole();
  if (!isSuperAdminLikeRole(role)) {
    return null;
  }

  return <CompaniesContent />;
}
