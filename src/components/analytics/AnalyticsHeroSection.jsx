import StatCard from "@/components/analytics/StatCard";

export default function AnalyticsHeroSection({
  projectName,
  trendRange,
  analytics,
  formatNumber,
  formatPercent,
  formatCompactMoney,
  formatMoney,
  Activity,
  BriefcaseBusiness,
  Target,
  Wallet,
}) {
  return (
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
            Loyiha:{" "}
            <span className="font-semibold text-white">
              {projectName || "Tanlanmagan"}
            </span>
          </div>
          <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs text-[color:var(--crm-muted)]">
            Oraliq:{" "}
            <span className="font-semibold text-white">{trendRange.from}</span>{" "}
            - <span className="font-semibold text-white">{trendRange.to}</span>
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
  );
}
