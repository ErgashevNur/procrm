import { useTranslation } from "react-i18next";

export default function DashboardOverviewCard({
  periodLabel,
  periodHint,
  totalLeads,
  tasks,
  hasDateRange,
  dateRange,
  formatDisplayDate,
  period,
  setPeriod,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}) {
  const { t } = useTranslation();
  return (
    <div
      className="crm-card crm-hairline overflow-hidden"
      style={{ animation: "fadeUp 0.45s ease 0.02s both" }}
    >
      <div className="mb-6 flex flex-col gap-4 border-b border-white/6 pb-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="crm-kicker">{t("dashboard.overview")}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white md:text-[2rem]">
            {periodLabel}
          </h1>
          <p className="mt-2 text-sm text-[color:var(--crm-muted)]">
            {periodHint}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs text-[color:var(--crm-muted)]">
            {t("dashboard.totalLeads")}:{" "}
            <span className="font-semibold text-white">{totalLeads}</span>
          </div>
          <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs text-[color:var(--crm-muted)]">
            {t("dashboard.tasks")}: <span className="font-semibold text-white">{tasks.total}</span>
          </div>
          {hasDateRange ? (
            <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs text-[color:var(--crm-muted)]">
              {t("dashboard.date")}:{" "}
              <span className="font-semibold text-white">
                {formatDisplayDate(dateRange.from)} -{" "}
                {formatDisplayDate(dateRange.to)}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-xs text-[color:var(--crm-muted)]">
          {t("dashboard.period")}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="crm-control h-11 rounded-2xl px-3.5 text-sm text-white outline-none"
          >
            <option value="all">{t("dashboard.periods.all")}</option>
            <option value="today">{t("dashboard.periods.today")}</option>
            <option value="week">{t("dashboard.periods.week")}</option>
            <option value="month">{t("dashboard.periods.month")}</option>
            <option value="custom">{t("dashboard.periods.custom")}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-[color:var(--crm-muted)]">
          {t("dashboard.startDate")}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            disabled={period !== "custom"}
            className="crm-control h-11 rounded-2xl px-3.5 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-[color:var(--crm-muted)]">
          {t("dashboard.endDate")}
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
  );
}
