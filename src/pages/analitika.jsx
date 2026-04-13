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
import AnalyticsHeroSection from "@/components/analytics/AnalyticsHeroSection";
import EmployeePerformanceSection from "@/components/analytics/EmployeePerformanceSection";
import InsightsSection from "@/components/analytics/InsightsSection";
import StatusComparisonSection from "@/components/analytics/StatusComparisonSection";
import StatusDistributionSection from "@/components/analytics/StatusDistributionSection";
import TaskStatusSection from "@/components/analytics/TaskStatusSection";
import TrendSection from "@/components/analytics/TrendSection";
import { apiUrl } from "@/lib/api";

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
          apiFetch(apiUrl(`analytics/status/${projectId}`)),
          apiFetch(
            apiUrl(`analytics/analystik/${projectId}?type=${trendType}&from=${trendRange.from}&to=${trendRange.to}`),
          ),
          apiFetch(
            apiUrl(`analytics/employee/statistics/${projectId}?from=${trendRange.from}&to=${trendRange.to}`),
          ),
          apiFetch(
            apiUrl(`analytics/tasks/${projectId}?type=${trendType}&from=${trendRange.from}&to=${trendRange.to}`),
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
        <AnalyticsHeroSection
          projectName={projectName}
          trendRange={trendRange}
          analytics={analytics}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
          formatCompactMoney={formatCompactMoney}
          formatMoney={formatMoney}
          Activity={Activity}
          BriefcaseBusiness={BriefcaseBusiness}
          Target={Target}
          Wallet={Wallet}
        />

        {error ? (
          <div className="rounded-[24px] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <section className="space-y-5">
          <TrendSection
            loading={loading}
            chartConfig={chartConfig}
            TREND_TABS={TREND_TABS}
            trendType={trendType}
            setTrendType={setTrendType}
            trendRange={trendRange}
            setTrendRange={setTrendRange}
            trendRows={trendRows}
            hasTrendBudget={hasTrendBudget}
            trendLeadTicks={trendLeadTicks}
            formatCompactMoney={formatCompactMoney}
            formatMoney={formatMoney}
            formatNumber={formatNumber}
          />

          <StatusDistributionSection
            loading={loading}
            analytics={analytics}
            rows={rows}
            chartConfig={chartConfig}
            formatNumber={formatNumber}
            formatPercent={formatPercent}
            formatMoney={formatMoney}
          />
        </section>

        <TaskStatusSection
          loading={loading}
          taskStats={taskStats}
          taskDonutData={taskDonutData}
          chartConfig={chartConfig}
          formatNumber={formatNumber}
          formatPercent={formatPercent}
          Activity={Activity}
          CircleCheckBig={CircleCheckBig}
          Clock3={Clock3}
          TriangleAlert={TriangleAlert}
        />

        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <EmployeePerformanceSection
            loading={loading}
            employeeRows={employeeRows}
            chartConfig={chartConfig}
            formatMoney={formatMoney}
            formatNumber={formatNumber}
          />

          <InsightsSection
            analytics={analytics}
            formatNumber={formatNumber}
            formatPercent={formatPercent}
            formatMoney={formatMoney}
            BriefcaseBusiness={BriefcaseBusiness}
            TrendingUp={TrendingUp}
            Wallet={Wallet}
          />
        </section>

        <StatusComparisonSection
          loading={loading}
          rows={rows}
          chartConfig={chartConfig}
          formatCompactMoney={formatCompactMoney}
          formatMoney={formatMoney}
          formatNumber={formatNumber}
        />
      </div>
    </div>
  );
}
