import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import DashboardOverviewCard from "@/components/dashboard/DashboardOverviewCard";
import DashboardStatCards from "@/components/dashboard/DashboardStatCards";
import DashboardStatusPanel from "@/components/dashboard/DashboardStatusPanel";
import DashboardTasksPanel from "@/components/dashboard/DashboardTasksPanel";
import DashboardLeadConversion from "@/components/dashboard/DashboardLeadConversion";
import useDashboardData from "@/hooks/useDashboardData";

function formatDisplayDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading, error, period, setPeriod, fromDate, setFromDate, toDate, setToDate } =
    useDashboardData(navigate);

  if (loading) {
    return <DashboardLoadingState />;
  }

  if (!data) {
    return <DashboardEmptyState error={error} />;
  }

  const {
    daily = 0,
    weekly = 0,
    monthly = 0,
    totalLeads = 0,
    dateRange = {
      from: "",
      to: "",
    },
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
      all: t("dashboard.periodLabels.all"),
      today: t("dashboard.periodLabels.today"),
      week: t("dashboard.periodLabels.week"),
      month: t("dashboard.periodLabels.month"),
      custom: t("dashboard.periodLabels.custom"),
    }[period] || "Dashboard";

  const periodHint =
    {
      all: t("dashboard.periodHints.all"),
      today: t("dashboard.periodHints.today"),
      week: t("dashboard.periodHints.week"),
      month: t("dashboard.periodHints.month"),
      custom: t("dashboard.periodHints.custom"),
    }[period] || t("dashboard.periodHints.default");

  const hasDateRange = dateRange.from && dateRange.to;

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
        {/* <Header /> */}
        <DashboardOverviewCard
          periodLabel={periodLabel}
          periodHint={periodHint}
          totalLeads={totalLeads}
          tasks={tasks}
          hasDateRange={hasDateRange}
          dateRange={dateRange}
          formatDisplayDate={formatDisplayDate}
          period={period}
          setPeriod={setPeriod}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
        />

        {/* Title */}
        {/* <div style={{ animation: "fadeUp 0.4s ease both" }}>
          <h1 className="text-xl font-black tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-gray-600">Umumiy ko'rsatkichlar</p>
        </div> */}

        {/* ── Top stat cards ── */}
        <DashboardStatCards
          totalLeads={totalLeads}
          daily={daily}
          weekly={weekly}
          monthly={monthly}
        />

        {/* ── Middle row ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Statuslar bo'yicha */}
          <DashboardStatusPanel
            totalLeads={totalLeads}
            byStatus={byStatus}
            percentages={percentages}
          />

          {/* Tasklar */}
          <DashboardTasksPanel tasks={tasks} />
        </div>

        {/* ── Lead conversion summary ── */}
        <DashboardLeadConversion byStatus={byStatus} totalLeads={totalLeads} />
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
