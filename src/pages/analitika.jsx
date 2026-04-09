import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BriefcaseBusiness,
  CircleCheckBig,
  Clock3,
  Target,
  TrendingUp,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { API } from "@/lib/api";

const STATUS_COLORS = [
  "#69a7ff",
  "#34c759",
  "#ff9f0a",
  "#ff453a",
  "#7c92ff",
  "#4dd0e1",
];

const TREND_TABS = [
  { key: "daily", label: "Kunlik" },
  { key: "weekly", label: "Haftalik" },
  { key: "monthly", label: "Oylik" },
];

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("uz-UZ")} so'm`;
}

function formatCompactMoney(value) {
  return new Intl.NumberFormat("uz-UZ", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

function formatPercent(value) {
  return `${new Intl.NumberFormat("uz-UZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))}%`;
}

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("user");
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }

  return res;
}

function normalizeList(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.result)) return json.result;
  if (Array.isArray(json?.items)) return json.items;
  return [];
}

function formatYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatTrendLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const hasTime =
    String(value).includes("T") ||
    /^\d{2}:\d{2}/.test(String(value)) ||
    /\d{2}:\d{2}:\d{2}/.test(String(value));

  if (hasTime) {
    return new Intl.DateTimeFormat("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function buildLeadTicks(rows) {
  const maxLeads = rows.reduce((max, row) => Math.max(max, Number(row?.leads || 0)), 0);
  if (maxLeads <= 6) {
    return Array.from({ length: maxLeads + 1 }, (_, index) => index);
  }

  const step = maxLeads <= 20 ? 2 : Math.ceil(maxLeads / 6);
  const ticks = [];
  for (let value = 0; value <= maxLeads; value += step) {
    ticks.push(value);
  }
  if (ticks[ticks.length - 1] !== maxLeads) ticks.push(maxLeads);
  return ticks;
}

function defaultRangeByType(type) {
  const to = new Date();
  const from = new Date(to);
  if (type === "daily") from.setDate(from.getDate() - 6);
  else if (type === "weekly") from.setDate(from.getDate() - 55);
  else from.setDate(from.getDate() - 364);
  return { from: formatYMD(from), to: formatYMD(to) };
}

function normalizeStatusAnalyticsPayload(json) {
  return normalizeList(json).map((item, index) => ({
    statusId: Number(item?.statusId ?? index + 1),
    statusName: item?.statusName || `Status #${index + 1}`,
    leadCount: Number(item?.leadCount || 0),
    percent: Number(item?.percent || 0),
    totalBudget: Number(item?.totalBudget || 0),
    color: STATUS_COLORS[index % STATUS_COLORS.length],
  }));
}

function normalizeTrendPayload(json) {
  if (json && typeof json === "object" && !Array.isArray(json)) {
    const entries = Object.entries(json).filter(([, count]) => typeof count !== "object");
    if (entries.length > 0) {
      return entries
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, count]) => ({
          label: formatTrendLabel(date),
          rawLabel: date,
          leads: Number(count || 0),
          budget: 0,
        }));
    }
  }

  if (json?.value && typeof json.value === "object" && !Array.isArray(json.value)) {
    return Object.entries(json.value)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({
        label: formatTrendLabel(date),
        rawLabel: date,
        leads: Number(count || 0),
        budget: 0,
      }));
  }

  return normalizeList(json).map((item, index) => ({
    label: formatTrendLabel(item?.label || item?.date || item?.day || item?.period) || `Nuqta ${index + 1}`,
    rawLabel: item?.label || item?.date || item?.day || item?.period || `Nuqta ${index + 1}`,
    leads: Number(item?.leadCount ?? item?.leadsCount ?? item?.count ?? item?.total ?? 0),
    budget: Number(item?.totalBudget ?? item?.budget ?? item?.sum ?? 0),
  }));
}

function normalizeEmployeeStatsPayload(json) {
  return normalizeList(json).map((item, index) => ({
    id: Number(item?.employeeId ?? item?.id ?? index + 1),
    name:
      item?.employeeName ||
      item?.fullName ||
      item?.name ||
      item?.operatorName ||
      `Xodim #${index + 1}`,
    leadCount: Number(item?.leadCount ?? item?.count ?? item?.totalLeads ?? 0),
    totalBudget: Number(item?.totalBudget ?? item?.budget ?? item?.sum ?? 0),
  }));
}

function isSuccessStatus(name) {
  const normalized = String(name || "").toLowerCase();
  return normalized.includes("muvaff") || normalized.includes("success");
}

function StatCard({ title, value, caption, icon: Icon, tone = "#69a7ff" }) {
  return (
    <div className="crm-card crm-hairline relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-10 right-0 h-24 w-24 rounded-full opacity-30 blur-3xl"
        style={{ background: tone }}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="crm-kicker">{title}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
              {value}
            </p>
          </div>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{
              background: `${tone}18`,
              border: `1px solid ${tone}30`,
            }}
          >
            <Icon size={18} style={{ color: tone }} />
          </div>
        </div>
        <p className="mt-3 text-sm text-[color:var(--crm-muted)]">{caption}</p>
      </div>
    </div>
  );
}

function SectionHeader({ kicker, title, description }) {
  return (
    <div className="mb-5">
      <p className="crm-kicker">{kicker}</p>
      <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
        {title}
      </h2>
      {description ? (
        <p className="mt-1.5 text-sm text-[color:var(--crm-muted)]">{description}</p>
      ) : null}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex h-[280px] items-center justify-center rounded-[24px] border border-white/6 bg-white/[0.03] text-sm text-[color:var(--crm-muted)]">
      {text}
    </div>
  );
}

function SkeletonBlock({ className }) {
  return <div className={`crm-skeleton ${className}`} />;
}

function normalizeTaskStatsPayload(json) {
  const source = json?.value || json?.data?.value || json?.data || json || {};

  return {
    total: Number(source?.total || 0),
    finished: Number(source?.finished || 0),
    finishedPercent: Number(source?.finishedPercent || 0),
    started: Number(source?.started || 0),
    startedPercent: Number(source?.startedPercent || 0),
    expired: Number(source?.expired || 0),
    expiredPercent: Number(source?.expiredPercent || 0),
  };
}

export default function Analitika() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [trendType, setTrendType] = useState("daily");
  const [trendRange, setTrendRange] = useState(() => defaultRangeByType("daily"));
  const [trendRows, setTrendRows] = useState([]);
  const [employeeRows, setEmployeeRows] = useState([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    finished: 0,
    finishedPercent: 0,
    started: 0,
    startedPercent: 0,
    expired: 0,
    expiredPercent: 0,
  });

  const projectId = localStorage.getItem("projectId");
  const projectName = localStorage.getItem("projectName");

  useEffect(() => {
    setTrendRange(defaultRangeByType(trendType));
  }, [trendType]);

  useEffect(() => {
    const load = async () => {
      if (!projectId) {
        setRows([]);
        setTrendRows([]);
        setEmployeeRows([]);
        setLoading(false);
        setError("Loyiha tanlanmagan");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [statusRes, trendRes, employeeRes, tasksRes] = await Promise.all([
          apiFetch(`${API}/analytics/status/${projectId}`),
          apiFetch(
            `${API}/analytics/analystik/${projectId}?type=${trendType}&from=${trendRange.from}&to=${trendRange.to}`,
          ),
          apiFetch(
            `${API}/analytics/employee/statistics/${projectId}?from=${trendRange.from}&to=${trendRange.to}`,
          ),
          apiFetch(
            `${API}/analytics/tasks/${projectId}?type=${trendType}&from=${trendRange.from}&to=${trendRange.to}`,
          ),
        ]);

        if (!statusRes || !trendRes || !employeeRes || !tasksRes) return;

        if (
          statusRes.status === 403 ||
          trendRes.status === 403 ||
          employeeRes.status === 403 ||
          tasksRes.status === 403
        ) {
          navigate("/403", { replace: true });
          return;
        }

        if (!statusRes.ok) throw new Error(`Status API HTTP ${statusRes.status}`);
        if (!trendRes.ok) throw new Error(`Trend API HTTP ${trendRes.status}`);
        if (!employeeRes.ok) throw new Error(`Employee API HTTP ${employeeRes.status}`);
        if (!tasksRes.ok) throw new Error(`Tasks API HTTP ${tasksRes.status}`);

        const [statusJson, trendJson, employeeJson, tasksJson] = await Promise.all([
          statusRes.json(),
          trendRes.json(),
          employeeRes.json(),
          tasksRes.json(),
        ]);

        setRows(normalizeStatusAnalyticsPayload(statusJson));
        setTrendRows(normalizeTrendPayload(trendJson));
        setEmployeeRows(normalizeEmployeeStatsPayload(employeeJson));

        setTaskStats(normalizeTaskStatsPayload(tasksJson));
      } catch (e) {
        console.error("Analitika yuklash xatosi:", e);
        setError(e?.message || "Analitika ma'lumotlarini yuklab bo'lmadi");
        setRows([]);
        setTrendRows([]);
        setEmployeeRows([]);
        setTaskStats(normalizeTaskStatsPayload({}));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, projectId, trendRange.from, trendRange.to, trendType]);

  const analytics = useMemo(() => {
    const totalDeals = rows.reduce((sum, row) => sum + row.leadCount, 0);
    const totalAmount = rows.reduce((sum, row) => sum + row.totalBudget, 0);
    const successStatus = rows.find((row) => isSuccessStatus(row.statusName)) || null;
    const closeRate = successStatus?.percent || 0;

    const pie = rows.map((row) => ({
      name: row.statusName,
      value: row.leadCount,
      percent: row.percent,
      fill: row.color,
    }));

    const topEmployee = [...employeeRows].sort((a, b) => b.leadCount - a.leadCount)[0];
    const topStatus = [...rows].sort((a, b) => b.leadCount - a.leadCount)[0] || null;

    return {
      totalDeals,
      totalAmount,
      closeRate,
      successStatus,
      statusCount: rows.length,
      pie,
      topStatus,
      topEmployee,
    };
  }, [employeeRows, rows]);

  const hasTrendBudget = useMemo(
    () => trendRows.some((row) => Number(row.budget) > 0),
    [trendRows],
  );
  const trendLeadTicks = useMemo(() => buildLeadTicks(trendRows), [trendRows]);

  const chartConfig = {
    leads: { label: "Lead soni", color: "#69a7ff" },
    budget: { label: "Budjet", color: "#34c759" },
    finished: { label: "Bajarilgan", color: "#34c759" },
    started: { label: "Jarayonda", color: "#69a7ff" },
    expired: { label: "Muddati o'tgan", color: "#ff453a" },
  };

  const taskDonutData = [
    { name: "Bajarilgan", value: taskStats.finished, fill: "#34c759" },
    { name: "Jarayonda", value: taskStats.started, fill: "#69a7ff" },
    { name: "Muddati o'tgan", value: taskStats.expired, fill: "#ff453a" },
  ];

  return (
    <div className="crm-page">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
        <div className="absolute top-0 left-[18%] h-72 w-72 rounded-full bg-[#69a7ff] blur-[110px]" />
        <div className="absolute top-20 right-[10%] h-64 w-64 rounded-full bg-[#34c759] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-5">
        <section className="crm-card crm-hairline overflow-hidden">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="crm-kicker">Analitika</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-[2.15rem]">
                Sotuv va jarayonlar bo'yicha chuqur tahlil
              </h1>
              <p className="mt-2 text-sm text-[color:var(--crm-muted)]">
                Dashboard uslubidagi yagona ko'rinish: statuslar, trendlar, tasklar
                va xodimlar natijasi bir sahifada.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs text-[color:var(--crm-muted)]">
                Loyiha: <span className="font-semibold text-white">{projectName || "Tanlanmagan"}</span>
              </div>
              <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs text-[color:var(--crm-muted)]">
                Oraliq: <span className="font-semibold text-white">{trendRange.from}</span> -{" "}
                <span className="font-semibold text-white">{trendRange.to}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Jami lead"
              value={formatNumber(analytics.totalDeals)}
              caption="Barcha statuslar bo'yicha umumiy son"
              icon={Activity}
              tone="#69a7ff"
            />
            <StatCard
              title="Statuslar soni"
              value={formatNumber(analytics.statusCount)}
              caption="Analitikaga kirgan jami status bosqichlari"
              icon={BriefcaseBusiness}
              tone="#7c92ff"
            />
            <StatCard
              title="Muvaffaqiyatli ulush"
              value={formatPercent(analytics.closeRate)}
              caption={
                analytics.successStatus
                  ? `${analytics.successStatus.statusName} statusi ulushi`
                  : "Muvaffaqiyatli status topilmadi"
              }
              icon={Target}
              tone="#34c759"
            />
            <StatCard
              title="Jami budjet"
              value={formatCompactMoney(analytics.totalAmount)}
              caption={formatMoney(analytics.totalAmount)}
              icon={Wallet}
              tone="#ff9f0a"
            />
          </div>
        </section>

        {error ? (
          <div className="rounded-[24px] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <section className="space-y-5">
          <div className="crm-card crm-hairline">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeader
                kicker="Oqim"
                title="Leadlar dinamikasi"
                description="Tanlangan davr bo'yicha leadlar oqimi va o'sish sur'ati."
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.04] p-1">
                  {TREND_TABS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTrendType(item.key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        trendType === item.key
                          ? "bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                          : "text-[color:var(--crm-muted)] hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={trendRange.from}
                    onChange={(e) =>
                      setTrendRange((prev) => ({ ...prev, from: e.target.value }))
                    }
                    className="crm-control h-10 rounded-2xl px-3 text-sm"
                  />
                  <input
                    type="date"
                    value={trendRange.to}
                    onChange={(e) =>
                      setTrendRange((prev) => ({ ...prev, to: e.target.value }))
                    }
                    className="crm-control h-10 rounded-2xl px-3 text-sm"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <SkeletonBlock className="h-[360px]" />
            ) : trendRows.length === 0 ? (
              <EmptyState text="Trend chizmasi uchun ma'lumot topilmadi." />
            ) : (
              <ChartContainer className="h-[360px]" config={chartConfig}>
                <AreaChart data={trendRows}>
                  <defs>
                    <linearGradient id="leadsFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#69a7ff" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#69a7ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="budgetFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#34c759" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#34c759" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#8ca0b6", fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[0, "dataMax"]}
                    allowDecimals={false}
                    ticks={trendLeadTicks}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#8ca0b6", fontSize: 12 }}
                  />
                  {hasTrendBudget ? (
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatCompactMoney(value)}
                      tick={{ fill: "#8ca0b6", fontSize: 12 }}
                    />
                  ) : null}
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(label, payload) =>
                          payload?.[0]?.payload?.rawLabel || label
                        }
                        formatter={(value, name) =>
                          name === "Budjet"
                            ? [formatMoney(value), name]
                            : [formatNumber(value), name]
                        }
                      />
                    }
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="leads"
                    name="Lead soni"
                    stroke="#69a7ff"
                    fill="url(#leadsFill)"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#69a7ff", stroke: "#dbeafe" }}
                    activeDot={{ r: 6, strokeWidth: 2, fill: "#69a7ff", stroke: "#ffffff" }}
                  />
                  {hasTrendBudget ? (
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="budget"
                      name="Budjet"
                      stroke="#34c759"
                      fill="url(#budgetFill)"
                      strokeWidth={2.5}
                    />
                  ) : null}
                </AreaChart>
              </ChartContainer>
            )}
          </div>

          <div className="crm-card crm-hairline">
            <SectionHeader
              kicker="Statuslar"
              title="Statuslar bo'yicha taqsimot"
              description="Har bir status uchun ID, lead soni, ulushi va budjeti bir joyda."
            />

            {loading ? (
              <SkeletonBlock className="h-[360px]" />
            ) : analytics.pie.length === 0 ? (
              <EmptyState text="Status ulushlari uchun ma'lumot topilmadi." />
            ) : (
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                <div className="rounded-[28px] border border-white/6 bg-white/[0.02] p-4">
                  <ChartContainer className="mx-auto h-[320px] max-w-[360px]" config={chartConfig}>
                    <PieChart>
                      <Pie
                        data={analytics.pie}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={72}
                        outerRadius={122}
                        paddingAngle={4}
                      >
                        {analytics.pie.map((item) => (
                          <Cell key={item.name} fill={item.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => [formatNumber(value), "Lead"]}
                          />
                        }
                      />
                    </PieChart>
                  </ChartContainer>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {rows.map((row) => (
                    <div
                      key={row.statusId}
                      className="rounded-[24px] border border-white/6 bg-white/[0.03] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: row.color }}
                            />
                            <span className="rounded-full border border-white/8 bg-white/[0.05] px-2 py-1 text-[10px] font-semibold tracking-[0.18em] text-[color:var(--crm-muted)] uppercase">
                              ID {row.statusId}
                            </span>
                          </div>
                          <p className="mt-2 truncate text-sm font-medium text-white">
                            {row.statusName}
                          </p>
                          <p className="mt-1 text-xs text-[color:var(--crm-muted)]">
                            {formatNumber(row.leadCount)} ta lead
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">
                            {formatPercent(row.percent)}
                          </p>
                          <p className="mt-1 text-[11px] text-[color:var(--crm-muted)]">
                            {formatMoney(row.totalBudget)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="h-2 rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full transition-[width] duration-500"
                            style={{
                              width: `${Math.max(0, Math.min(100, row.percent))}%`,
                              backgroundColor: row.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="crm-card crm-hairline">
          <SectionHeader
            kicker="Vazifalar"
            title="Vazifalar holati"
            description="Jami vazifalar, bajarilganlar, jarayondagi va kechikkan ishlar kesimi."
          />

          {loading ? (
            <SkeletonBlock className="h-[320px]" />
          ) : taskStats.total === 0 ? (
            <EmptyState text="Task statistikasi topilmadi." />
          ) : (
            <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr] xl:items-center">
              <div className="rounded-[28px] border border-white/6 bg-white/[0.02] p-4">
                <ChartContainer className="mx-auto h-[260px] max-w-[280px]" config={chartConfig}>
                  <PieChart>
                    <Pie
                      data={taskDonutData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={102}
                      paddingAngle={4}
                    >
                      {taskDonutData.map((item) => (
                        <Cell key={item.name} fill={item.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => [formatNumber(value), name]}
                        />
                      }
                    />
                    <text
                      x="50%"
                      y="46%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white text-3xl font-semibold"
                    >
                      {formatNumber(taskStats.total)}
                    </text>
                    <text
                      x="50%"
                      y="60%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-[#8ca0b6] text-xs"
                    >
                      jami task
                    </text>
                  </PieChart>
                </ChartContainer>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Jami task",
                    value: formatNumber(taskStats.total),
                    icon: Activity,
                    color: "#7c92ff",
                  },
                  {
                    label: "Bajarilgan",
                    value: formatNumber(taskStats.finished),
                    icon: CircleCheckBig,
                    color: "#34c759",
                  },
                  {
                    label: "Bajarilgan foiz",
                    value: formatPercent(taskStats.finishedPercent),
                    icon: CircleCheckBig,
                    color: "#34c759",
                  },
                  {
                    label: "Jarayonda",
                    value: formatNumber(taskStats.started),
                    icon: Clock3,
                    color: "#69a7ff",
                  },
                  {
                    label: "Jarayonda foiz",
                    value: formatPercent(taskStats.startedPercent),
                    icon: Clock3,
                    color: "#69a7ff",
                  },
                  {
                    label: "Muddati o'tgan",
                    value: formatNumber(taskStats.expired),
                    icon: TriangleAlert,
                    color: "#ff453a",
                  },
                  {
                    label: "Kechikkan foiz",
                    value: formatPercent(taskStats.expiredPercent),
                    icon: TriangleAlert,
                    color: "#ff453a",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/6 bg-white/[0.03] p-3"
                  >
                    <item.icon size={15} style={{ color: item.color }} />
                    <p className="mt-2 text-sm font-medium text-white">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="crm-card crm-hairline">
            <SectionHeader
              kicker="Xodimlar"
              title="Xodimlar natijasi"
              description="Lead soni va tushum bo'yicha faol xodimlar ko'rsatkichi."
            />

            {loading ? (
              <SkeletonBlock className="h-[340px]" />
            ) : employeeRows.length === 0 ? (
              <EmptyState text="Xodimlar bo'yicha ma'lumot topilmadi." />
            ) : (
              <>
                <ChartContainer className="h-[260px]" config={chartConfig}>
                  <BarChart
                    data={[...employeeRows]
                      .sort((a, b) => b.leadCount - a.leadCount)
                      .slice(0, 6)}
                    layout="vertical"
                    margin={{ left: 8, right: 8 }}
                  >
                    <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#8ca0b6", fontSize: 12 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={90}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name, item) =>
                            name === "Budjet"
                              ? [formatMoney(value), item.name]
                              : [formatNumber(value), name]
                          }
                        />
                      }
                    />
                    <Bar
                      dataKey="leadCount"
                      name="Lead soni"
                      fill="#69a7ff"
                      radius={[0, 10, 10, 0]}
                    />
                  </BarChart>
                </ChartContainer>

                <div className="mt-4 space-y-2">
                  {employeeRows
                    .slice()
                    .sort((a, b) => b.leadCount - a.leadCount)
                    .slice(0, 5)
                    .map((employee, index) => (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between rounded-[24px] border border-white/6 bg-white/[0.03] px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {index + 1}. {employee.name}
                          </p>
                          <p className="mt-1 text-xs text-[color:var(--crm-muted)]">
                            {formatMoney(employee.totalBudget)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold tracking-[-0.03em] text-white">
                            {formatNumber(employee.leadCount)}
                          </p>
                          <p className="text-[11px] text-[color:var(--crm-muted)]">lead</p>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>

          <div className="crm-card crm-hairline">
              <SectionHeader
                kicker="Xulosa"
                title="Qisqa xulosalar"
                description="Hozirgi holat bo'yicha asosiy ko'rsatkichlar va muhim nuqtalar."
              />

              <div className="space-y-3">
                <div className="rounded-[24px] border border-white/6 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <BriefcaseBusiness size={16} className="text-[#69a7ff]" />
                    Eng faol xodim
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--crm-muted)]">
                    {analytics.topEmployee
                      ? `${analytics.topEmployee.name} ${formatNumber(
                          analytics.topEmployee.leadCount,
                        )} ta lead bilan oldinda.`
                      : "Xodimlar bo'yicha yetarli ma'lumot yo'q."}
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/6 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <TrendingUp size={16} className="text-[#34c759]" />
                    Asosiy status
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--crm-muted)]">
                    {analytics.topStatus
                      ? `${analytics.topStatus.statusName} statusi ${formatNumber(
                          analytics.topStatus.leadCount,
                        )} ta lead va ${formatPercent(analytics.topStatus.percent)} ulush bilan yetakchi.`
                      : "Statuslar bo'yicha ma'lumot yo'q."}
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/6 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Wallet size={16} className="text-[#ff9f0a]" />
                    Budjet signali
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--crm-muted)]">
                    Umumiy budjet {formatMoney(analytics.totalAmount)}.
                    {analytics.topStatus
                      ? ` Eng katta ulush ${analytics.topStatus.statusName} statusiga tegishli.`
                      : ""}
                  </p>
                </div>
              </div>
          </div>
        </section>

        <section className="crm-card crm-hairline">
          <SectionHeader
            kicker="Taqqoslash"
            title="Statuslar kesimida lead va budjet"
            description="Qaysi statuslar son va qiymat bo'yicha asosiy og'irlikni ushlayotganini ko'rsatadi."
          />

          {loading ? (
            <SkeletonBlock className="h-[360px]" />
          ) : rows.length === 0 ? (
            <EmptyState text="Statuslar bo'yicha taqqoslash uchun ma'lumot topilmadi." />
          ) : (
            <ChartContainer className="h-[360px]" config={chartConfig}>
              <BarChart data={rows} margin={{ left: 0, right: 12 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  dataKey="statusName"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8ca0b6", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8ca0b6", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCompactMoney(value)}
                  tick={{ fill: "#8ca0b6", fontSize: 12 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) =>
                        name === "Budjet"
                          ? [formatMoney(value), name]
                          : [formatNumber(value), name]
                      }
                    />
                  }
                />
                <Bar
                  yAxisId="left"
                  dataKey="leadCount"
                  name="Lead soni"
                  fill="#69a7ff"
                  radius={[10, 10, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="totalBudget"
                  name="Budjet"
                  fill="#34c759"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </section>
      </div>
    </div>
  );
}
