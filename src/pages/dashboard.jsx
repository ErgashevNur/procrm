import { useState, useEffect, useRef } from "react";
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
const tour = true 

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
      className="relative overflow-hidden rounded-2xl border border-white/6 p-5"
      style={{
        background: "linear-gradient(145deg,#0f2438 0%,#0a1929 100%)",
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
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {sub != null && (
          <span className="text-xs font-semibold text-gray-500">{sub}</span>
        )}
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-white">
        <Counter value={value} />
      </p>
      <p className="mt-1 text-xs font-medium tracking-widest text-gray-500 uppercase">
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
          <span className="text-xs font-medium text-gray-400">
            {meta.label}
          </span>
          <span className="text-xs font-bold text-white">
            {count}{" "}
            <span className="font-normal text-gray-600">({percent}%)</span>
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
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
      <p className="text-center text-[11px] leading-tight font-medium text-gray-500">
        {label}
      </p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Shimmer({ className }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-white/4 ${className}`} />
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const projectId = localStorage.getItem("projectId");

  useEffect(() => {
    if (projectId) {
      const load = async () => {
        try {
          const res = await apiFetch(
            `${API}/dashboard/crm/leads/statistik/${projectId}`,
          );
          if (!res) return;
          const json = await res.json();
          setData(json);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      load();
    } else {
      setData({
        daily: 0,
        weekly: 0,
        monthly: 0,
        totalLeads: 0,
        byStatus: {
          new: 0,
          pending: 0,
          success: 0,
          canceled: 0,
        },
        percentages: {
          success: 0,
          pending: 0,
          canceled: 0,
          new: 0,
        },
        tasks: {
          total: 0,
          completed: 0,
          overdue: 0,
          pending: 0,
          completionRate: 0,
        },
      });
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071828] p-6">
        <div className="mx-auto max-w-5xl space-y-4">
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

  if (!data) return null;

  const { daily, weekly, monthly, totalLeads, byStatus, percentages, tasks } =
    data;

  return (
    <div className="min-h-screen bg-[#071828] p-6">
      {/* Grid bg */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Top glow */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 h-72 w-150 -translate-x-1/2 opacity-[0.07]"
        style={{
          background: "radial-gradient(ellipse,#3b82f6,transparent)",
          filter: "blur(50px)",
        }}
      />

      <div className="relative mx-auto max-w-5xl space-y-5">
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
            className="rounded-2xl border border-white/6 p-5"
            style={{
              background: "linear-gradient(145deg,#0f2438 0%,#0a1929 100%)",
              animation: "fadeUp 0.5s ease 0.25s both",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                Statuslar bo'yicha
              </p>
              <span className="text-xs font-semibold text-gray-600">
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
            className="rounded-2xl border border-white/6 p-5"
            style={{
              background: "linear-gradient(145deg,#0f2438 0%,#0a1929 100%)",
              animation: "fadeUp 0.5s ease 0.30s both",
            }}
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                Tasklar
              </p>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/6 bg-white/3 px-2.5 py-1">
                <CalendarCheck2 size={11} className="text-blue-400" />
                <span className="text-xs font-bold text-white">
                  {tasks.total}
                </span>
                <span className="text-[10px] text-gray-600">jami</span>
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
                  <span className="mt-0.5 text-[9px] text-gray-500">
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
                      <span className="text-xs text-gray-500">{label}</span>
                    </div>
                    <span className="text-xs font-bold text-white">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini rings */}
            <div className="grid grid-cols-3 gap-2 border-t border-white/4 pt-4">
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
          className="rounded-2xl border border-white/6 p-5"
          style={{
            background: "linear-gradient(145deg,#0f2438 0%,#0a1929 100%)",
            animation: "fadeUp 0.5s ease 0.35s both",
          }}
        >
          <p className="mb-4 text-xs font-bold tracking-widest text-gray-500 uppercase">
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
                  <span className="text-[9px] text-gray-600">{meta.label}</span>
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
