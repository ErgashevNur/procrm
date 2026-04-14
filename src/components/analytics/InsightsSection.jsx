import SectionHeader from "@/components/analytics/SectionHeader";

export default function InsightsSection({
  analytics,
  formatNumber,
  formatPercent,
  formatMoney,
  BriefcaseBusiness,
  TrendingUp,
  Wallet,
}) {
  return (
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
                )} ta lead va ${formatPercent(
                  analytics.topStatus.percent,
                )} ulush bilan yetakchi.`
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
  );
}
