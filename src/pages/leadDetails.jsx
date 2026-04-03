import { useEffect, useState, useRef } from "react";
import {
  Phone,
  MapPin,
  Tag,
  MessageSquare,
  ChevronLeft,
  MoreVertical,
  HandCoins,
  SendHorizonal,
  Calendar,
  MessageCircle,
  CheckSquare,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pencil,
  X,
  Check,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "../components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  MANAGEMENT_ROLES,
  ROLES,
  canDeleteData,
  getCurrentRole,
} from "@/lib/rbac";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;
const TOAST_STYLE = {
  style: {
    background: "#0f2231",
    color: "#e5e7eb",
    border: "1px solid rgba(96,165,250,0.2)",
  },
};

function toastSuccess(message) {
  toast.success(message, TOAST_STYLE);
}

function toastError(message) {
  toast.error(message, TOAST_STYLE);
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function parseTaskDateValue(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const normalized = value.trim();
  if (!normalized) return null;

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(normalized);
  if (hasTimezone) {
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (!match) {
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const [, year, month, day, hour = "00", minute = "00", second = "00"] =
    match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
}

function toLocalDateTimeInputValue(value) {
  const date = parseTaskDateValue(value);
  if (!date) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function toApiDateTimeValue(value) {
  const date = parseTaskDateValue(value);
  if (!date) return null;

  const timezoneOffsetMinutes = -date.getTimezoneOffset();
  const sign = timezoneOffsetMinutes >= 0 ? "+" : "-";
  const absOffsetMinutes = Math.abs(timezoneOffsetMinutes);
  const offsetHours = Math.floor(absOffsetMinutes / 60);
  const offsetMinutes = absOffsetMinutes % 60;

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}${sign}${pad2(offsetHours)}:${pad2(offsetMinutes)}`;
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : item?.name || item?.tag))
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

async function extractApiMessage(res, fallback) {
  try {
    const text = await res.text();
    if (!text) return fallback;
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed?.message === "string" && parsed.message.trim()) {
        return parsed.message;
      }
      if (Array.isArray(parsed?.message) && parsed.message.length > 0) {
        return String(parsed.message[0]);
      }
      return fallback;
    } catch {
      return text.trim() || fallback;
    }
  } catch {
    return fallback;
  }
}

function normalizeOperator(user) {
  if (!user || typeof user !== "object") return null;
  const id = user.id ?? user.userId ?? user._id;
  if (!id) return null;

  const fullName =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.name ||
    "";

  return {
    id,
    role: user.role,
    fullName,
    email: user.email || "",
  };
}

function extractUsersFromPayload(payload) {
  const candidates = [
    payload,
    payload?.data,
    payload?.items,
    payload?.users,
    payload?.results,
    payload?.result,
    payload?.data?.items,
    payload?.data?.users,
    payload?.data?.results,
    payload?.result?.items,
    payload?.result?.users,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

async function fetchSalesManagers(headers) {
  const limit = 25;
  let page = 1;
  let all = [];

  // API response shakli turlicha bo'lishi mumkin, shuning uchun ehtiyotkor parse
  while (page <= 20) {
    const res = await fetch(
      `${API}/user/all/sales-manager?limit=${limit}&page=${page}`,
      { headers },
    );
    if (!res.ok) break;

    const payload = await res.json();
    const list = extractUsersFromPayload(payload);
    const normalized = list.map(normalizeOperator).filter(Boolean);

    all = [...all, ...normalized];

    if (normalized.length < limit) break;
    page += 1;
  }

  return all;
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";

const formatDate = (dateString) => {
  const date = parseTaskDateValue(dateString);
  if (!date) return "—";
  return date.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (dateString) => {
  const date = parseTaskDateValue(dateString);
  if (!date) return "—";
  return date.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMonthYear = (dateString) => {
  const date = parseTaskDateValue(dateString);
  if (!date) return "";
  return date.toLocaleDateString("uz-UZ", {
    month: "long",
    year: "numeric",
  });
};

const maxBirthDate = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
})();

const EVENT_CFG = {
  Description: { icon: MessageCircle, color: "#3b82f6", label: "Izoh" },
  tasks: { icon: CheckSquare, color: "#10b981", label: "Task" },
  message: { icon: MessageSquare, color: "#3b82f6", label: "Xabar" },
  status_change: {
    icon: ArrowRightLeft,
    color: "#8b5cf6",
    label: "Status o'zgardi",
  },
  default: { icon: Tag, color: "#6b7280", label: "Hodisa" },
};
const getCfg = (type) => EVENT_CFG[type] || EVENT_CFG.default;

const INPUT_TYPES = [
  {
    value: "Description",
    label: "Izoh",
    icon: MessageCircle,
    color: "#3b82f6",
    placeholder: "Izoh yozing...",
  },
  {
    value: "tasks",
    label: "Task",
    icon: CheckSquare,
    color: "#10b981",
    placeholder: "Vazifani kiriting...",
  },
];

const TASK_STATUS_OPTIONS = [
  { value: "STARTED", label: "Jarayonda", color: "#f59e0b" },
  { value: "CANCELED", label: "Kutilmoqda", color: "#6b7280" },
  { value: "FINISHED", label: "Bajarildi", color: "#10b981" },
];

// ─── EVENT CARD ───────────────────────────────────────────────────────────────
function EventCard({ event, headers, onRefresh, canDelete = true }) {
  const cfg = getCfg(event.type);
  const Icon = cfg.icon;
  const isTask = event.type === "tasks";

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(
    event.text || event.description || "",
  );
  const [editDate, setEditDate] = useState(() =>
    toLocalDateTimeInputValue(event.taskDate),
  );
  const [editStatus, setEditStatus] = useState(event.status || "STARTED");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const STATUS_MAP = {
    STARTED: {
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.2)",
      icon: Clock,
      label: "Jarayonda",
    },
    CANCELED: {
      color: "#6b7280",
      bg: "rgba(107,114,128,0.1)",
      border: "rgba(107,114,128,0.2)",
      icon: AlertCircle,
      label: "Bekor qilingan",
    },
    FINISHED: {
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.18)",
      icon: CheckCircle2,
      label: "Bajarildi",
    },
  };
  const tsCfg = isTask ? STATUS_MAP[event.status] || STATUS_MAP.CANCELED : null;

  const handleSaveTask = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      const body = { description: editText.trim(), status: editStatus };
      if (editDate) body.taskDate = toApiDateTimeValue(editDate);
      const res = await fetch(`${API}/tasks/${event.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toastSuccess("Task yangilandi ✅");
      setEditing(false);
      await onRefresh();
    } catch {
      toastError("Xatolik ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDesc = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/Description/${event.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ text: editText.trim() }),
      });
      if (!res.ok) throw new Error();
      toastSuccess("Izoh yangilandi ✅");
      setEditing(false);
      await onRefresh();
    } catch {
      toastError("Xatolik ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      toastError("Sizda o'chirish uchun ruxsat yo'q");
      return;
    }
    if (!window.confirm("O'chirilsinmi?")) return;
    setDeleting(true);
    try {
      const url = isTask
        ? `${API}/tasks/${event.id}`
        : `${API}/Description/${event.id}`;
      const res = await fetch(url, { method: "DELETE", headers });
      if (!res.ok) throw new Error();
      toastSuccess("O'chirildi ✅");
      await onRefresh();
    } catch {
      toastError("O'chirishda xato ❌");
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = isTask ? handleSaveTask : handleSaveDesc;

  return (
    <div className="group flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: `${cfg.color}15`,
            border: `1px solid ${cfg.color}28`,
          }}
        >
          <Icon size={14} style={{ color: cfg.color }} />
        </div>
        <div
          className="w-px flex-1 bg-white/[0.04]"
          style={{ minHeight: 12 }}
        />
      </div>

      <div
        className="mb-3 flex-1 overflow-hidden rounded-xl border border-white/[0.05] p-4 transition-colors group-hover:bg-white/[0.02]"
        style={{
          background: isTask
            ? "rgba(16,185,129,0.03)"
            : "rgba(255,255,255,0.015)",
          borderLeft: `2px solid ${cfg.color}35`,
        }}
      >
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
              style={{ color: cfg.color, background: `${cfg.color}15` }}
            >
              {cfg.label}
            </span>
            {isTask && tsCfg && (
              <span
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  color: tsCfg.color,
                  background: tsCfg.bg,
                  border: `1px solid ${tsCfg.border}`,
                }}
              >
                <tsCfg.icon size={9} />
                {tsCfg.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] text-gray-600">
              <Clock size={10} />
              {formatDateTime(event.createdAt)}
            </div>
            {!editing && (
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => {
                    setEditing(true);
                    setEditText(event.text || event.description || "");
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-white/10 hover:text-blue-400"
                >
                  <Pencil size={11} />
                </button>
                {canDelete ? (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-white/10 hover:text-red-400 disabled:opacity-40"
                  >
                    <Trash2 size={11} />
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {!editing && (
          <>
            <p className="text-sm leading-relaxed text-gray-300">
              {event.text || event.description}
            </p>
            {isTask && (
              <div
                className="mt-3 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
                style={{
                  background: tsCfg ? tsCfg.bg : "rgba(16,185,129,0.06)",
                  border: `1px solid ${tsCfg ? tsCfg.border : "rgba(16,185,129,0.15)"}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Calendar
                    size={13}
                    style={{ color: tsCfg ? tsCfg.color : "#10b981" }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: tsCfg ? tsCfg.color : "#10b981" }}
                  >
                    Muddat:
                  </span>
                  <span className="text-xs font-bold text-white">
                    {event.taskDate
                      ? formatDateTime(event.taskDate)
                      : "Belgilanmagan"}
                  </span>
                </div>
                {tsCfg && (
                  <tsCfg.icon
                    size={14}
                    style={{ color: tsCfg.color, flexShrink: 0 }}
                  />
                )}
              </div>
            )}
          </>
        )}

        {editing && (
          <div className="space-y-2.5">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
              placeholder={isTask ? "Vazifa matni..." : "Izoh matni..."}
              autoFocus
            />
            {isTask && (
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  {TASK_STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setEditStatus(s.value)}
                      className="rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all"
                      style={{
                        color: editStatus === s.value ? s.color : "#4b5563",
                        background:
                          editStatus === s.value
                            ? `${s.color}18`
                            : "rgba(255,255,255,0.04)",
                        border: `1px solid ${editStatus === s.value ? `${s.color}35` : "transparent"}`,
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <input
                  type="datetime-local"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-300 outline-none focus:border-green-500/40"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !editText.trim()}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40"
                style={{ background: "#10b981", color: "#fff" }}
              >
                {saving ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                ) : (
                  <Check size={12} />
                )}
                Saqlash
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-white"
              >
                <X size={12} />
                Bekor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DATETIME PICKER ──────────────────────────────────────────────────────────
function TaskDatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const parsed = parseTaskDateValue(value);
  const today = new Date();
  const [viewYear, setViewYear] = useState(
    parsed ? parsed.getFullYear() : today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    parsed ? parsed.getMonth() : today.getMonth(),
  );
  const [selDay, setSelDay] = useState(parsed ? parsed.getDate() : null);
  const [hour, setHour] = useState(parsed ? parsed.getHours() : 9);
  const [minute, setMinute] = useState(parsed ? parsed.getMinutes() : 0);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const MONTHS = [
    "Yan",
    "Fev",
    "Mar",
    "Apr",
    "May",
    "Iyn",
    "Iyl",
    "Avg",
    "Sen",
    "Okt",
    "Noy",
    "Dek",
  ];
  const WDAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = (() => {
    const d = new Date(viewYear, viewMonth, 1).getDay();
    return d === 0 ? 6 : d - 1;
  })();
  const isPast = (d) =>
    new Date(viewYear, viewMonth, d) <
    new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () =>
    viewMonth === 0
      ? (setViewMonth(11), setViewYear((y) => y - 1))
      : setViewMonth((m) => m - 1);
  const nextMonth = () =>
    viewMonth === 11
      ? (setViewMonth(0), setViewYear((y) => y + 1))
      : setViewMonth((m) => m + 1);

  const confirm = () => {
    if (!selDay) return;
    onChange(
      `${viewYear}-${pad2(viewMonth + 1)}-${pad2(selDay)}T${pad2(hour)}:${pad2(minute)}`,
    );
    setOpen(false);
  };

  const displayLabel = value
    ? (() => {
        const d = parseTaskDateValue(value);
        if (!d) return null;
        return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
      })()
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-all"
        style={{
          borderColor: value
            ? "rgba(16,185,129,0.35)"
            : "rgba(255,255,255,0.07)",
          background: value
            ? "rgba(16,185,129,0.07)"
            : "rgba(255,255,255,0.03)",
          color: value ? "#e2ffe8" : "#6b7280",
        }}
      >
        <Calendar size={13} style={{ color: value ? "#10b981" : "#4b5563" }} />
        <span>{displayLabel || "Muddat tanlang"}</span>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="ml-1 cursor-pointer text-gray-500 transition-colors hover:text-red-400"
          >
            ✕
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 z-50 mb-2 overflow-hidden rounded-xl shadow-2xl"
          style={{
            width: 272,
            background: "#0a1929",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center justify-between border-b border-white/[0.05] px-3 py-2">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-6 w-6 items-center justify-center rounded text-base text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
            >
              ‹
            </button>
            <span className="text-xs font-semibold text-white">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-6 w-6 items-center justify-center rounded text-base text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 px-2 pt-2">
            {WDAYS.map((d) => (
              <div
                key={d}
                className="py-0.5 text-center text-[9px] font-bold text-gray-700 uppercase"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5 px-2 pb-2">
            {Array(firstDay)
              .fill(null)
              .map((_, i) => (
                <div key={`e${i}`} />
              ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const past = isPast(d);
              const isSel = selDay === d;
              const isToday =
                d === today.getDate() &&
                viewMonth === today.getMonth() &&
                viewYear === today.getFullYear();
              return (
                <button
                  key={d}
                  type="button"
                  disabled={past}
                  onClick={() => setSelDay(d)}
                  className="aspect-square rounded-md text-[11px] transition-all"
                  style={{
                    background: isSel
                      ? "#10b981"
                      : isToday
                        ? "rgba(16,185,129,0.12)"
                        : "transparent",
                    color: isSel
                      ? "#fff"
                      : past
                        ? "#1e3a4a"
                        : isToday
                          ? "#10b981"
                          : "#c8dce8",
                    fontWeight: isSel || isToday ? 700 : 400,
                    cursor: past ? "not-allowed" : "pointer",
                    border:
                      isToday && !isSel
                        ? "1px solid rgba(16,185,129,0.25)"
                        : "1px solid transparent",
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <div className="space-y-2.5 border-t border-white/[0.05] px-3 py-3">
            {[
              ["Soat", hour, setHour, 23],
              ["Daqiqa", minute, setMinute, 59],
            ].map(([label, val, setter, max]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-right text-[10px] text-gray-600">
                  {label}
                </span>
                <input
                  type="range"
                  min={0}
                  max={max}
                  step={label === "Daqiqa" ? 5 : 1}
                  value={val}
                  onChange={(e) => setter(+e.target.value)}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full"
                  style={{
                    accentColor: "#10b981",
                    background: `linear-gradient(to right,#10b981 ${(val / max) * 100}%,#162840 ${(val / max) * 100}%)`,
                  }}
                />
                <span className="w-7 shrink-0 text-xs font-bold text-white tabular-nums">
                  {pad2(val)}
                </span>
              </div>
            ))}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {[
                [9, 0],
                [10, 0],
                [12, 0],
                [14, 0],
                [16, 0],
                [18, 0],
              ].map(([h, m]) => (
                <button
                  key={`qt${h}${m}`}
                  type="button"
                  onClick={() => {
                    setHour(h);
                    setMinute(m);
                  }}
                  className="rounded px-2 py-0.5 text-[10px] font-semibold transition-colors"
                  style={{
                    background:
                      hour === h && minute === m
                        ? "rgba(16,185,129,0.2)"
                        : "rgba(255,255,255,0.05)",
                    color: hour === h && minute === m ? "#10b981" : "#4b6070",
                    border: `1px solid ${hour === h && minute === m ? "rgba(16,185,129,0.3)" : "transparent"}`,
                  }}
                >
                  {pad2(h)}:{pad2(m)}
                </button>
              ))}
            </div>
          </div>
          <div
            className="flex items-center justify-between border-t border-white/[0.05] px-3 py-2"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <span className="text-[11px] text-gray-600">
              {selDay
                ? `${selDay} ${MONTHS[viewMonth]}, ${pad2(hour)}:${pad2(minute)}`
                : "Kun tanlanmagan"}
            </span>
            <button
              type="button"
              onClick={confirm}
              disabled={!selDay}
              className="rounded-lg px-3 py-1 text-xs font-semibold transition-all"
              style={{
                background: selDay ? "#10b981" : "#162840",
                color: selDay ? "#fff" : "#2a4560",
                cursor: selDay ? "pointer" : "not-allowed",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── INPUT BAR ────────────────────────────────────────────────────────────────
function InputBar({ onSubmit, sending }) {
  const [text, setText] = useState("");
  const [type, setType] = useState(INPUT_TYPES[0]);
  const [taskDate, setTaskDate] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 130) + "px";
  }, [text]);

  const handleTypeChange = (t) => {
    setType(t);
    if (t.value !== "tasks") setTaskDate("");
  };

  const submit = () => {
    if (!text.trim() || sending) return;
    onSubmit(text.trim(), type.value, taskDate || null);
    setText("");
    setTaskDate("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const TypeIcon = type.icon;
  const isTask = type.value === "tasks";

  return (
    <div
      className="sticky bottom-0 z-10 border-t px-5 py-4"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        background: "linear-gradient(to top, #071828 70%, rgba(7,24,40,0.88))",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="mx-auto max-w-3xl space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            {INPUT_TYPES.map((t) => {
              const TIcon = t.icon;
              const active = type.value === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => handleTypeChange(t)}
                  className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all"
                  style={{
                    color: active ? t.color : "#4b5563",
                    background: active ? `${t.color}12` : "transparent",
                    border: `1px solid ${active ? `${t.color}25` : "transparent"}`,
                  }}
                >
                  <TIcon size={12} />
                  {t.label}
                  {active && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: t.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          {isTask && <TaskDatePicker value={taskDate} onChange={setTaskDate} />}
          <span className="ml-auto text-[11px] text-gray-700">Ctrl+Enter</span>
        </div>

        <div className="flex items-end gap-2.5">
          <div
            className="flex flex-1 items-start gap-3 rounded-xl px-4 py-3 transition-all duration-200"
            style={{
              background: "#0c1e2e",
              border: `1px solid ${text ? `${type.color}30` : "rgba(255,255,255,0.06)"}`,
              boxShadow: text ? `0 0 0 3px ${type.color}08` : "none",
            }}
          >
            <TypeIcon
              size={15}
              className="mt-0.5 shrink-0"
              style={{ color: text ? type.color : "#374151" }}
            />
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
              }}
              placeholder={type.placeholder}
              rows={2}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
              style={{ lineHeight: "1.6", maxHeight: 130 }}
            />
          </div>
          <button
            onClick={submit}
            disabled={!text.trim() || sending}
            className="flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30"
            style={{
              background: text.trim()
                ? `linear-gradient(135deg, ${type.color}, ${type.color}88)`
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${text.trim() ? `${type.color}35` : "rgba(255,255,255,0.05)"}`,
              boxShadow: text.trim() ? `0 4px 16px ${type.color}35` : "none",
            }}
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <>
                <span>Yuborish</span>
                <SendHorizonal size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const LeadDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get("leadId");
  const token = localStorage.getItem("user");
  const projectId = localStorage.getItem("projectId");
  const role = getCurrentRole();
  const canAssignOperator = MANAGEMENT_ROLES.includes(role);
  const canDeleteEntries = canDeleteData(role);
  // FIX 1: userId = projectId bug tuzatildi — tasks lead ichidan keladi, alohida fetch yo'q

  const [dealData, setDealData] = useState(null);
  const [events, setEvents] = useState([]);
  const [leadSource, setLeadSource] = useState([]);
  const [operators, setOperators] = useState([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState("");
  const [assigningOperator, setAssigningOperator] = useState(false);
  const [activeTab, setActiveTab] = useState("asosiy");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const taskSoundRef = useRef(null);

  // FIX 2: tag editing — array state
  const [editTags, setEditTags] = useState([""]);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // FIX 3: mergeEvents — description array "type" fieldsiz kelishi mumkin
  const mergeEvents = (descs, tasks) => {
    const descList = (Array.isArray(descs) ? descs : []).map((d) => ({
      ...d,
      type: "Description", // har doim majburiy
    }));
    const taskList = (Array.isArray(tasks) ? tasks : []).map((t) => ({
      ...t,
      type: "tasks",
      text: t.description || t.text,
    }));
    return [...descList, ...taskList].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );
  };

  useEffect(() => {
    if (!token || !leadId) return;
    (async () => {
      try {
        // FIX 3: tasks alohida fetch yo'q — lead ichidagi tasks ishlatiladi
        const [leadRes, descRes, sourceRes] = await Promise.all([
          fetch(`${API}/leeds/${leadId}`, { headers }),
          fetch(`${API}/Description/lead/${leadId}?projectId=${projectId}`, {
            headers,
          }),
          fetch(`${API}/lead-source/${projectId}`, { headers }),
        ]);

        if (leadRes.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        const [lead, descs, sources] = await Promise.all([
          leadRes.json(),
          descRes.ok ? descRes.json() : [],
          sourceRes.ok ? sourceRes.json() : [],
        ]);

        const normalizedLeadTags = normalizeTags(lead?.tag);
        setDealData({ ...lead, tag: normalizedLeadTags });
        setLeadSource(Array.isArray(sources) ? sources : []);
        // FIX 3: lead.tasks ichidan olamiz
        setEvents(mergeEvents(descs, lead.tasks || []));
        const preAssignedId =
          lead?.assignedUser?.id || lead?.assignedUserId || lead?.userId || "";
        setSelectedOperatorId(preAssignedId ? String(preAssignedId) : "");
        // FIX 2: tag array bilan editTags ni to'ldirish
        const tagArr = normalizedLeadTags.length ? normalizedLeadTags : [""];
        setEditTags(tagArr);
      } catch (err) {
        console.error(err);
        toastError("Ma'lumotlar yuklanmadi");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const audio = new Audio("/POST_task.mp3");
    audio.preload = "auto";
    taskSoundRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
      taskSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!canAssignOperator || !token || !projectId) return;
    (async () => {
      try {
        let salesManagers = await fetchSalesManagers(headers);

        // Fallback: ba'zi backendlarda umumiy users endpoint ishlaydi
        if (salesManagers.length === 0) {
          const res = await fetch(`${API}/users?projectId=${projectId}`, {
            headers,
          });
          if (res.ok) {
            const payload = await res.json();
            const users = extractUsersFromPayload(payload)
              .map(normalizeOperator)
              .filter(Boolean);
            salesManagers = users.filter((u) => u.role === ROLES.SALESMANAGER);
          }
        }

        const unique = Array.from(
          new Map(salesManagers.map((u) => [String(u.id), u])).values(),
        );
        setOperators(unique);
      } catch {
        // operator list yuklanmasa ham detail ishlayveradi
      }
    })();
  }, [canAssignOperator, token, projectId]);

  const refreshEvents = async () => {
    try {
      const [descRes, leadRes] = await Promise.all([
        fetch(`${API}/Description/lead/${leadId}?projectId=${projectId}`, {
          headers,
        }),
        fetch(`${API}/leeds/${leadId}`, { headers }),
      ]);
      const descs = descRes?.ok ? await descRes.json() : [];
      const lead = leadRes?.ok ? await leadRes.json() : null;
      if (lead) {
        setDealData({ ...lead, tag: normalizeTags(lead?.tag) });
        setEvents(mergeEvents(descs, lead.tasks || []));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tasks POST: backend `date` key kutadi
  const handlePostDesc = async (text, type, date) => {
    setSending(true);
    try {
      let shouldPlayTaskSound = false;
      if (type === "tasks") {
        const body = {
          projectId: Number(projectId),
          leadsId: Number(leadId),
          description: text,
          ...(date && { date: toApiDateTimeValue(date) }),
        };
        const res = await fetch(`${API}/tasks`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        const payload = await res.json().catch(() => null);
        shouldPlayTaskSound = Boolean(
          payload?.success === true ||
            payload?.id ||
            payload?.task?.id ||
            payload?.data?.id ||
            payload?.message,
        );
      } else {
        const res = await fetch(`${API}/Description`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            projectId: Number(projectId),
            leadsId: Number(leadId),
            text,
          }),
        });
        if (!res.ok) throw new Error();
      }
      await refreshEvents();
      if (type === "tasks" && shouldPlayTaskSound) {
        try {
          const audio = taskSoundRef.current;
          if (audio) {
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise) playPromise.catch(() => {});
          }
        } catch {
          // Audio oynatishda muammo bo'lsa, oddiygina davom etamiz
        }
      }
      toastSuccess(
        type === "tasks" ? "Task qo'shildi ✅" : "Izoh qo'shildi ✅",
      );
    } catch {
      toastError("Yuborishda xato ❌");
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDealData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignOperator = async (operatorId = selectedOperatorId) => {
    if (!operatorId || !dealData) {
      toastError("Operator tanlang");
      return;
    }
    setSelectedOperatorId(String(operatorId));
    setAssigningOperator(true);
    try {
      const res = await fetch(`${API}/leeds/${leadId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          projectId: Number(projectId),
          assignedUserId: Number(operatorId),
        }),
      });
      if (!res.ok) {
        const msg = await extractApiMessage(
          res,
          "Operator biriktirib bo'lmadi",
        );
        throw new Error(msg);
      }
      const selectedUser = operators.find(
        (u) => String(u.id) === String(operatorId),
      );
      setDealData((prev) => ({
        ...prev,
        assignedUser: selectedUser || prev?.assignedUser,
      }));
      toastSuccess("Operator biriktirildi");
    } catch (err) {
      toastError(err?.message || "Operator biriktirishda xatolik");
    } finally {
      setAssigningOperator(false);
    }
  };

  // FIX 2: handleSubmit — tag array yuborish
  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      firstName: dealData.firstName,
      lastName: dealData.lastName,
      phone: dealData.phone,
      extraPhone: dealData.extraPhone || undefined,
      adress: dealData.adress || undefined,
      budjet: Number(dealData.budjet) || undefined,
      leadSourceId: Number(dealData.leadSourceId) || undefined,
      projectId: Number(projectId),
      tag: normalizeTags(editTags), // FIX: array
      birthDate: dealData.birthDate
        ? new Date(dealData.birthDate).toISOString().split("T")[0]
        : undefined,
    };
    const nextTags = normalizeTags(editTags);
    const updatePromise = fetch(`${API}/leeds/${leadId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    }).then((res) => {
      if (!res.ok) throw new Error();
      setDealData((prev) => ({ ...prev, tag: nextTags }));
      setEditTags(nextTags.length ? nextTags : [""]);
      setActiveTab("asosiy");
      return res;
    });
    toast.promise(updatePromise, {
      loading: "Saqlanmoqda...",
      success: "Yangilandi ✅",
      error: "Xatolik ❌",
    }, TOAST_STYLE);
    try {
      await updatePromise;
      setActiveTab("asosiy");
    } catch {
      // toast.promise handles feedback
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#071828] text-gray-200">
        <div className="flex w-96 shrink-0 flex-col border-r border-white/[0.05] bg-[#0a1929]">
          <div className="border-b border-white/[0.05] p-5">
            <div className="mb-3 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-xl bg-white/5" />
              <Skeleton className="h-5 w-28 rounded-lg bg-white/5" />
            </div>
          </div>
          <div className="space-y-4 p-5">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-9 w-full rounded-xl bg-white/[0.03]"
                />
              ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex-1 space-y-3 p-6">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-24 w-full rounded-xl bg-white/[0.03]"
                />
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dealData) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#071828] text-gray-200">
      {/* ═══ LEFT PANEL ═══ */}
      <div
        className="flex w-96 shrink-0 flex-col overflow-hidden border-r"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "#0a1929" }}
      >
        {/* Header */}
        <div
          className="shrink-0 border-b px-5 py-4"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <h1 className="text-base font-semibold text-white">
                Bitim #{dealData.id}
              </h1>
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] text-gray-500 hover:text-white">
              <MoreVertical size={15} />
            </button>
          </div>

          {/* FIX 2: tag — array ko'rsatish */}
          {Array.isArray(dealData.tag) && dealData.tag.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {dealData.tag.map((t, i) => (
                <span
                  key={i}
                  className="inline-block rounded-lg px-3 py-1 text-xs font-medium"
                  style={{
                    background: "rgba(59,130,246,0.12)",
                    color: "#60a5fa",
                    border: "1px solid rgba(59,130,246,0.2)",
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className="shrink-0 border-b px-5 py-4"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-base font-bold text-white"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#7c3aed)" }}
            >
              {dealData.firstName?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-semibold text-white">
                {dealData.firstName} {dealData.lastName}
              </p>
              <p className="text-xs text-gray-600">#{dealData.id} mijoz</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex shrink-0 border-b"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          {["Asosiy", "Tahrirlash"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className="flex-1 border-b-2 py-3 text-xs font-semibold transition-all"
              style={{
                borderBottomColor:
                  activeTab === tab.toLowerCase() ? "#3b82f6" : "transparent",
                color: activeTab === tab.toLowerCase() ? "#60a5fa" : "#6b7280",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="scrollbar-hide flex-1 overflow-y-auto">
          {/* ── ASOSIY TAB ── */}
          {activeTab === "asosiy" && (
            <div className="space-y-4 p-5">
              <div>
                <p className="mb-0.5 text-[11px] text-gray-600 uppercase">
                  Operator
                </p>
                {canAssignOperator ? (
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedOperatorId}
                      onValueChange={handleAssignOperator}
                      disabled={assigningOperator}
                    >
                      <SelectTrigger
                        className="h-8 border-0 bg-transparent px-0 text-sm font-medium text-white shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        style={{ boxShadow: "none" }}
                      >
                        <SelectValue placeholder="Operator tanlang" />
                      </SelectTrigger>
                      <SelectContent className="mt-2">
                        {operators.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.fullName || u.email || `Operator #${u.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {assigningOperator && (
                      <span className="text-xs text-gray-500">Saqlanmoqda...</span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-white">
                    {dealData?.assignedUser?.fullName || "—"}
                  </p>
                )}
              </div>
              <InfoRow label="Loyiha" value={dealData?.project?.name} />
              <InfoRow label="Manba" value={dealData?.leadSource?.name} />
              <div>
                <p className="mb-0.5 text-[11px] text-gray-600 uppercase">
                  Budjet
                </p>
                <div className="flex items-center gap-2">
                  <HandCoins size={14} className="text-yellow-400" />
                  <p className="text-sm font-medium text-white">
                    {formatCurrency(dealData.budjet || 0)}
                  </p>
                </div>
              </div>
              <div
                className="border-t pt-4"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
              >
                <div className="space-y-3">
                  <PhoneRow label="Tel raqam" value={dealData.phone} />
                  <PhoneRow
                    label="Qo'shimcha raqam"
                    value={dealData.extraPhone}
                  />
                  <div>
                    <p className="text-[11px] text-gray-600">Tug'ilgan sana</p>
                    <div className="flex items-center gap-2">
                      <Calendar
                        size={13}
                        className="shrink-0 text-yellow-400"
                      />
                      <p className="text-sm text-white">
                        {formatDate(dealData.birthDate)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-600">Manzil</p>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="shrink-0 text-red-400" />
                      <p className="text-sm text-white">
                        {dealData.adress || "—"}
                      </p>
                    </div>
                  </div>
                  {/* FIX 2: tag array ko'rsatish */}
                  {Array.isArray(dealData.tag) && dealData.tag.length > 0 && (
                    <div>
                      <p className="mb-1 text-[11px] text-gray-600">Teglar</p>
                      <div className="flex flex-wrap gap-1">
                        {dealData.tag.map((t, i) => (
                          <span
                            key={i}
                            className="rounded px-2 py-0.5 text-xs"
                            style={{
                              background: "rgba(59,130,246,0.1)",
                              color: "#60a5fa",
                              border: "1px solid rgba(59,130,246,0.2)",
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAHRIRLASH TAB ── */}
          {activeTab === "tahrirlash" && (
            <form className="p-5 text-white" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Ism</FieldLabel>
                    <Input
                      name="firstName"
                      value={dealData.firstName || ""}
                      onChange={handleChange}
                      placeholder="Ism"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Familiya</FieldLabel>
                    <Input
                      name="lastName"
                      value={dealData.lastName || ""}
                      onChange={handleChange}
                      placeholder="Familiya"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Tug'ilgan sana</FieldLabel>
                  {/* FIX: birthDate ISO string -> slice(0,10) */}
                  <Input
                    type="date"
                    name="birthDate"
                    value={
                      dealData.birthDate
                        ? new Date(dealData.birthDate)
                            .toISOString()
                            .slice(0, 10)
                        : ""
                    }
                    onChange={handleChange}
                    max={maxBirthDate}
                  />
                  <p className="mt-0.5 text-[11px] text-gray-600">
                    18 yoshdan katta (max: {maxBirthDate.slice(0, 4)}-yil)
                  </p>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Telefon</FieldLabel>
                    <Input
                      type="tel"
                      name="phone"
                      value={dealData.phone || ""}
                      onChange={handleChange}
                      placeholder="+998 __ ___ __ __"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Qo'shimcha</FieldLabel>
                    <Input
                      type="tel"
                      name="extraPhone"
                      value={dealData.extraPhone || ""}
                      onChange={handleChange}
                      placeholder="+998 __ ___ __ __"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Teglar</FieldLabel>
                  <div className="flex flex-col gap-1.5">
                    {editTags.map((tag, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <Input
                          value={tag}
                          onChange={(e) => {
                            const next = [...editTags];
                            next[idx] = e.target.value;
                            setEditTags(next);
                          }}
                          placeholder="VIP, comfort..."
                          className="flex-1"
                        />
                        {editTags.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditTags((p) => p.filter((_, i) => i !== idx))
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-red-800/40 text-red-400 hover:bg-red-900/20"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setEditTags((p) => [...p, ""])}
                      className="flex items-center gap-1 self-start rounded-md border border-dashed border-[#2a4868] px-2.5 py-1 text-xs text-gray-400 hover:border-blue-500/50 hover:text-white"
                    >
                      + Teg qo'shish
                    </button>
                  </div>
                </Field>
                <Field>
                  <FieldLabel>Manzil</FieldLabel>
                  <Input
                    name="adress"
                    value={dealData.adress || ""}
                    onChange={handleChange}
                    placeholder="Manzil"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Budjet</FieldLabel>
                    <Input
                      type="number"
                      name="budjet"
                      value={dealData.budjet || ""}
                      onChange={handleChange}
                      placeholder="so'm"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Manba</FieldLabel>
                    <Select
                      value={
                        dealData.leadSourceId
                          ? String(dealData.leadSourceId)
                          : ""
                      }
                      onValueChange={(v) =>
                        setDealData((prev) => ({
                          ...prev,
                          leadSourceId: parseInt(v),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tanlang..." />
                      </SelectTrigger>
                      <SelectContent className="mt-2">
                        {leadSource.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("asosiy")}
                    className="flex-1 text-gray-400 hover:text-white"
                  >
                    Bekor
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500"
                  >
                    Saqlash
                  </Button>
                </div>
              </FieldGroup>
            </form>
          )}
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div
          className="flex shrink-0 items-center justify-end border-b px-5 py-3"
          style={{
            borderColor: "rgba(255,255,255,0.05)",
            background: "#071828",
          }}
        >
          {dealData?.status && (
            <div
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-white"
              style={{
                background: dealData.status.color || "#3b82f6",
                boxShadow: `0 2px 12px ${dealData.status.color || "#3b82f6"}50`,
              }}
            >
              {dealData.status.name}
            </div>
          )}
        </div>

        <div className="scrollbar-hide flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto max-w-2xl">
            {dealData.createdAt && (
              <>
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/[0.04]" />
                  <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1 text-xs text-gray-600">
                    {formatMonthYear(dealData.createdAt)}
                  </span>
                  <div className="h-px flex-1 bg-white/[0.04]" />
                </div>
                <div className="mb-4 flex items-center gap-2 text-xs text-gray-700">
                  <Tag size={10} />
                  {formatDateTime(dealData.createdAt)} • Lead yaratildi
                </div>
              </>
            )}

            {events.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
                <MessageSquare size={36} className="text-gray-800" />
                <p className="text-sm text-gray-600">Hali faoliyat yo'q</p>
                <p className="text-xs text-gray-700">
                  Izoh yoki task qo'shish uchun pastdagi maydondan foydalaning
                </p>
              </div>
            ) : (
              events.map((event) => (
                <EventCard
                  key={`${event.type}-${event.id}`}
                  event={event}
                  headers={headers}
                  onRefresh={refreshEvents}
                  canDelete={canDeleteEntries}
                />
              ))
            )}
          </div>
        </div>

        <InputBar onSubmit={handlePostDesc} sending={sending} />
      </div>
    </div>
  );
};

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="mb-0.5 text-[11px] text-gray-600 uppercase">{label}</p>
      <p className="text-sm font-medium text-white">{value || "—"}</p>
    </div>
  );
}

function PhoneRow({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-gray-600">{label}</p>
      <div className="flex items-center gap-2">
        <Phone size={13} className="shrink-0 text-blue-400" />
        {value ? (
          <a
            href={`tel:${value}`}
            className="text-sm text-blue-400 hover:underline"
          >
            {value}
          </a>
        ) : (
          <span className="text-sm text-gray-600">—</span>
        )}
      </div>
    </div>
  );
}

export default LeadDetails;
