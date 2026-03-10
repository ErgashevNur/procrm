import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function pickStatusValue(obj, keys) {
  for (const key of keys) {
    if (obj?.[key] != null) return toNumber(obj[key]);
  }
  return 0;
}

function normalizeByStatus(raw = {}) {
  return {
    new: pickStatusValue(raw, ["new"]),
    pending: pickStatusValue(raw, ["pending", "inProgress", "in_progress"]),
    success: pickStatusValue(raw, ["success", "successful", "done"]),
    canceled: pickStatusValue(raw, ["canceled", "cancelled", "rejected"]),
  };
}

function normalizePercentages(raw = {}) {
  return {
    new: pickStatusValue(raw, ["new"]),
    pending: pickStatusValue(raw, ["pending", "inProgress", "in_progress"]),
    success: pickStatusValue(raw, ["success", "successful", "done"]),
    canceled: pickStatusValue(raw, ["canceled", "cancelled", "rejected"]),
  };
}

function normalizeDashboardPayload(payload, selectedPeriodFallback) {
  const json =
    payload?.statsInPeriod || payload?.daily != null || payload?.byStatus
      ? payload
      : payload?.data || payload?.result || payload?.payload || payload;

  if (!json || typeof json !== "object") return null;

  if (json?.statsInPeriod) {
    const byStatus = normalizeByStatus(json.statsInPeriod.byStatus);
    const percentages = normalizePercentages(json.statsInPeriod.percentages);
    const totalLeads =
      toNumber(json.statsInPeriod.leadsCount) ||
      Object.values(byStatus).reduce((sum, val) => sum + toNumber(val), 0);

    const selectedPeriod = json.selectedPeriod || selectedPeriodFallback || "today";
    const daily =
      json?.summary?.daily != null
        ? toNumber(json.summary.daily)
        : selectedPeriod === "today" || selectedPeriod === "day"
          ? totalLeads
          : 0;
    const weekly =
      json?.summary?.weekly != null
        ? toNumber(json.summary.weekly)
        : selectedPeriod === "week"
          ? totalLeads
          : 0;
    const monthly =
      json?.summary?.monthly != null
        ? toNumber(json.summary.monthly)
        : selectedPeriod === "month"
          ? totalLeads
          : 0;

    return {
      ...json,
      totalLeads,
      byStatus,
      percentages,
      daily,
      weekly,
      monthly,
      tasks: json.tasksInPeriod || json.tasks,
    };
  }

  const hasLegacyShape =
    json?.daily != null ||
    json?.weekly != null ||
    json?.monthly != null ||
    json?.totalLeads != null ||
    json?.byStatus != null ||
    json?.percentages != null ||
    json?.tasks != null;

  if (!hasLegacyShape) return null;

  const legacy = {
    ...json,
    daily: toNumber(json.daily),
    weekly: toNumber(json.weekly),
    monthly: toNumber(json.monthly),
    totalLeads: toNumber(json.totalLeads),
    byStatus: normalizeByStatus(json.byStatus),
    percentages: normalizePercentages(json.percentages),
    tasks: json.tasks,
  };

  // If backend uses different wrapper keys, try to infer byStatus-like shape.
  if (
    legacy.totalLeads === 0 &&
    Object.values(legacy.byStatus).every((v) => toNumber(v) === 0) &&
    payload &&
    typeof payload === "object"
  ) {
    const byStatusCandidate =
      payload?.stats?.byStatus ||
      payload?.dashboard?.byStatus ||
      payload?.statistics?.byStatus;
    const percentagesCandidate =
      payload?.stats?.percentages ||
      payload?.dashboard?.percentages ||
      payload?.statistics?.percentages;
    if (byStatusCandidate) {
      const byStatus = normalizeByStatus(byStatusCandidate);
      return {
        ...legacy,
        byStatus,
        percentages: normalizePercentages(percentagesCandidate),
        totalLeads:
          toNumber(payload?.stats?.leadsCount) ||
          Object.values(byStatus).reduce((sum, v) => sum + toNumber(v), 0),
      };
    }
  }

  return legacy;
}

async function apiFetch(url) {
  const token = localStorage.getItem("user");
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }
  return res;
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef();

  useEffect(() => {
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(ease * value));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

// ── Arc progress ──────────────────────────────────────────────────────────────
function ArcProgress({ percent, color, size = 80, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{
          transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
    </svg>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <div
      className="crm-card crm-hairline relative overflow-hidden"
      style={{
        animation: `fadeUp 0.5s ease ${delay}s both`,
      }}
    >
      {/* Glow blob */}
      <div
        className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {sub != null && (
          <span className="rounded-full border border-white/8 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold tracking-[0.16em] text-[color:var(--crm-muted)] uppercase">
            {sub}
          </span>
        )}
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-white md:text-[2rem]">
        <Counter value={value} />
      </p>
      <p className="mt-1 text-[11px] font-semibold tracking-[0.2em] text-[color:var(--crm-muted-2)] uppercase">
        {label}
      </p>
    </div>
  );
}

// ── Status bar item ───────────────────────────────────────────────────────────
const STATUS_META = {
  new: { label: "Yangi", color: "#3b82f6", icon: Users },
  pending: { label: "Kutilmoqda", color: "#f59e0b", icon: Clock },
  success: { label: "Muvaffaqiyatli", color: "#22c55e", icon: CheckCircle2 },
  canceled: { label: "Bekor qilingan", color: "#ef4444", icon: XCircle },
};

function StatusBar({ statusKey, count, total, percent }) {
  const meta = STATUS_META[statusKey] || {
    label: statusKey,
    color: "#6b7280",
    icon: BarChart3,
  };
  const Icon = meta.icon;
  const w = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{
          background: `${meta.color}15`,
          border: `1px solid ${meta.color}25`,
        }}
      >
        <Icon size={13} style={{ color: meta.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-[color:var(--crm-muted)]">
            {meta.label}
          </span>
          <span className="text-xs font-bold text-white">
            {count}{" "}
            <span className="font-normal text-[color:var(--crm-muted-2)]">({percent}%)</span>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${w}%`,
              background: meta.color,
              boxShadow: `0 0 6px ${meta.color}60`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Task ring card ────────────────────────────────────────────────────────────
function TaskRing({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <ArcProgress percent={pct} color={color} size={72} stroke={6} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-white">{pct}%</span>
        </div>
      </div>
      <p className="text-center text-[11px] leading-tight font-medium text-[color:var(--crm-muted)]">
        {label}
      </p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Shimmer({ className }) {
  return <div className={`crm-skeleton rounded-2xl ${className}`} />;
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const initialPeriod = searchParams?.get("period") || "today";
  const initialFrom = searchParams?.get("from") || "";
  const initialTo = searchParams?.get("to") || "";
  const periodOptions = new Set(["all", "today", "week", "month", "custom"]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState(
    periodOptions.has(initialPeriod) ? initialPeriod : "today",
  );
  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);
  const projectId = localStorage.getItem("projectId");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (period && period !== "all") params.set("period", period);
    else params.delete("period");

    const useCustomDates = period === "custom" && fromDate && toDate;
    if (useCustomDates) {
      params.set("from", fromDate);
      params.set("to", toDate);
    } else {
      params.delete("from");
      params.delete("to");
    }

    const nextQuery = params.toString();
    const nextUrl = nextQuery
      ? `${window.location.pathname}?${nextQuery}`
      : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [period, fromDate, toDate]);

  useEffect(() => {
    if (projectId) {
      const hasOnlyOneDate = (fromDate && !toDate) || (!fromDate && toDate);
      if (period === "custom" && hasOnlyOneDate) return;

      const load = async () => {
        setLoading(true);
        setError("");
        try {
          const params = new URLSearchParams();
          if (period && period !== "all") params.set("period", period);
          if (period === "custom" && fromDate && toDate) {
            params.set("from", fromDate);
            params.set("to", toDate);
          }

          const res = await apiFetch(
            `${API}/dashboard/crm/leads/statistik/${projectId}?${params.toString()}`,
          );
          if (!res) return;
          if (res.status === 403) {
            navigate("/403", { replace: true });
            return;
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          const normalized = normalizeDashboardPayload(json, period);
          if (!normalized) {
            throw new Error("Dashboard API formati kutilgan ko'rinishda emas");
          }
          setData(normalized);
        } catch (e) {
          console.error(e);
          setError(e?.message || "Dashboard ma'lumotlarini olishda xatolik");
        } finally {
          setLoading(false);
        }
      };
      load();
    } else {
      setData(null);
      setError("Loyiha tanlanmagan");
      setLoading(false);
    }
  }, [projectId, period, fromDate, toDate, navigate]);

  if (loading) {
    return (
      <div className="crm-page">
        <div className="mx-auto max-w-5xl space-y-4">
          <Shimmer className="h-28" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Shimmer key={i} className="h-32" />
              ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Shimmer className="h-64" />
            <Shimmer className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="crm-page p-6">
        <div className="crm-card crm-hairline mx-auto max-w-5xl p-8 text-center">
          <p className="text-lg font-semibold tracking-[-0.02em] text-white">
            Dashboard ma'lumotlari topilmadi
          </p>
          {error ? (
            <p className="mt-2 text-sm text-rose-300">{error}</p>
          ) : (
            <p className="mt-2 text-sm text-[color:var(--crm-muted)]">
              API dan javob kelmagan yoki noto'g'ri formatda.
            </p>
          )}
        </div>
      </div>
    );
  }

  const {
    daily = 0,
    weekly = 0,
    monthly = 0,
    totalLeads = 0,
    byStatus = {
      new: 0,
      pending: 0,
      success: 0,
      canceled: 0,
    },
    percentages = {
      new: 0,
      pending: 0,
      success: 0,
      canceled: 0,
    },
    tasks = {
      total: 0,
      completed: 0,
      overdue: 0,
      pending: 0,
      completionRate: 0,
    },
  } = data || {};

  const periodLabel =
    {
      all: "Umumiy ko'rinish",
      today: "Bugungi holat",
      week: "Haftalik ko'rinish",
      month: "Oylik ko'rinish",
      custom: "Maxsus oraliq",
    }[period] || "Dashboard";

  return (
    <div className="crm-page relative min-h-full overflow-x-hidden">
      {/* Grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Top glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-72 w-150 -translate-x-1/2 opacity-[0.07]"
        style={{
          background: "radial-gradient(ellipse,#3b82f6,transparent)",
          filter: "blur(50px)",
        }}
      />

      <div className="relative mx-auto max-w-6xl space-y-5">
        <div
          className="crm-card crm-hairline overflow-hidden"
          style={{ animation: "fadeUp 0.45s ease 0.02s both" }}
        >
          <div className="mb-6 flex flex-col gap-4 border-b border-white/6 pb-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="crm-kicker">Overview</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-[2rem]">
                {periodLabel}
              </h1>
              <p className="mt-2 text-sm text-[color:var(--crm-muted)]">
                Leadlar va tasklar bo'yicha umumiy holat bir joyda jamlandi.
                Filtrlar URL bilan sinxron bo'lib qoladi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs text-[color:var(--crm-muted)]">
                Jami leadlar: <span className="font-semibold text-white">{totalLeads}</span>
              </div>
              <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs text-[color:var(--crm-muted)]">
                Tasklar: <span className="font-semibold text-white">{tasks.total}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-xs text-[color:var(--crm-muted)]">
              Davr
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="crm-control h-11 rounded-2xl px-3.5 text-sm text-white outline-none"
              >
                <option value="all">Hammasi</option>
                <option value="today">Bugun</option>
                <option value="week">Hafta</option>
                <option value="month">Oy</option>
                <option value="custom">Maxsus</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs text-[color:var(--crm-muted)]">
              Boshlanish sanasi
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                disabled={period !== "custom"}
                className="crm-control h-11 rounded-2xl px-3.5 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs text-[color:var(--crm-muted)]">
              Tugash sanasi
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={period !== "custom"}
                className="crm-control h-11 rounded-2xl px-3.5 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </label>
          </div>
        </div>

        {/* Title */}
        {/* <div style={{ animation: "fadeUp 0.4s ease both" }}>
          <h1 className="text-xl font-black tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-gray-600">Umumiy ko'rsatkichlar</p>
        </div> */}

        {/* ── Top stat cards ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={Users}
            label="Jami Leadlar"
            value={totalLeads}
            color="#3b82f6"
            delay={0.05}
          />
          <StatCard
            icon={TrendingUp}
            label="Bugun"
            value={daily}
            color="#22c55e"
            delay={0.1}
          />
          <StatCard
            icon={BarChart3}
            label="Bu hafta"
            value={weekly}
            color="#f59e0b"
            delay={0.15}
          />
          <StatCard
            icon={CalendarCheck2}
            label="Bu oy"
            value={monthly}
            color="#a78bfa"
            delay={0.2}
          />
        </div>

        {/* ── Middle row ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Statuslar bo'yicha */}
          <div
            className="crm-card"
            style={{
              animation: "fadeUp 0.5s ease 0.25s both",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="crm-kicker">
                Statuslar bo'yicha
              </p>
              <span className="text-xs font-semibold text-[color:var(--crm-muted-2)]">
                {totalLeads} ta
              </span>
            </div>
            <div className="space-y-1 divide-y divide-white/3">
              {Object.entries(byStatus).map(([key, count]) => (
                <StatusBar
                  key={key}
                  statusKey={key}
                  count={count}
                  total={totalLeads}
                  percent={percentages[key] ?? 0}
                />
              ))}
            </div>
          </div>

          {/* Tasklar */}
          <div
            className="crm-card"
            style={{
              animation: "fadeUp 0.5s ease 0.30s both",
            }}
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="crm-kicker">
                Tasklar
              </p>
              <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5">
                <CalendarCheck2 size={11} className="text-blue-400" />
                <span className="text-xs font-bold text-white">
                  {tasks.total}
                </span>
                <span className="text-[10px] text-[color:var(--crm-muted-2)]">jami</span>
              </div>
            </div>

            {/* Completion rate big arc */}
            <div className="mb-5 flex items-center gap-5">
              <div className="relative shrink-0">
                <ArcProgress
                  percent={tasks.completionRate}
                  color="#22c55e"
                  size={96}
                  stroke={8}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg leading-none font-black text-white">
                    {tasks.completionRate}%
                  </span>
                  <span className="mt-0.5 text-[9px] text-[color:var(--crm-muted)]">
                    bajarildi
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-2.5">
                {[
                  {
                    label: "Bajarilgan",
                    value: tasks.completed,
                    color: "#22c55e",
                    icon: CheckCircle2,
                  },
                  {
                    label: "Kutilmoqda",
                    value: tasks.pending,
                    color: "#f59e0b",
                    icon: Clock,
                  },
                  {
                    label: "Muddati o'tgan",
                    value: tasks.overdue,
                    color: "#ef4444",
                    icon: AlertTriangle,
                  },
                ].map(({ label, value, color, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={12} style={{ color }} />
                      <span className="text-xs text-[color:var(--crm-muted)]">{label}</span>
                    </div>
                    <span className="text-xs font-bold text-white">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini rings */}
            <div className="grid grid-cols-3 gap-2 border-t border-white/6 pt-4">
              <TaskRing
                label="Bajarilgan"
                value={tasks.completed}
                total={tasks.total}
                color="#22c55e"
              />
              <TaskRing
                label="Kutilmoqda"
                value={tasks.pending}
                total={tasks.total}
                color="#f59e0b"
              />
              <TaskRing
                label="Muddati o'tgan"
                value={tasks.overdue}
                total={tasks.total}
                color="#ef4444"
              />
            </div>
          </div>
        </div>

        {/* ── Lead conversion summary ── */}
        <div
          className="crm-card"
          style={{
            animation: "fadeUp 0.5s ease 0.35s both",
          }}
        >
          <p className="mb-4 crm-kicker">
            Lead konversiyasi
          </p>
          <div className="flex h-16 items-end gap-1">
            {Object.entries(byStatus).map(([key, count]) => {
              const meta = STATUS_META[key] || { color: "#6b7280", label: key };
              const h =
                totalLeads > 0 ? Math.max((count / totalLeads) * 100, 4) : 4;
              return (
                <div
                  key={key}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span className="text-[10px] font-bold text-white">
                    {count}
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all duration-1000"
                    style={{
                      height: `${h}%`,
                      minHeight: 6,
                      background: `linear-gradient(to top, ${meta.color}cc, ${meta.color}40)`,
                      boxShadow: `0 -2px 8px ${meta.color}40`,
                    }}
                  />
                  <span className="text-[9px] text-[color:var(--crm-muted-2)]">{meta.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
