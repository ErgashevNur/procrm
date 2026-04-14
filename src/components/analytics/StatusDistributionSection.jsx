import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import EmptyState from "@/components/analytics/EmptyState";
import SectionHeader from "@/components/analytics/SectionHeader";
import SkeletonBlock from "@/components/analytics/SkeletonBlock";

export default function StatusDistributionSection({
  loading,
  analytics,
  rows,
  chartConfig,
  formatNumber,
  formatPercent,
  formatMoney,
}) {
  return (
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
            <ChartContainer
              className="mx-auto h-[320px] max-w-[360px]"
              config={chartConfig}
            >
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
  );
}
