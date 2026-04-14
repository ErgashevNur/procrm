import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import EmptyState from "@/components/analytics/EmptyState";
import SectionHeader from "@/components/analytics/SectionHeader";
import SkeletonBlock from "@/components/analytics/SkeletonBlock";

export default function EmployeePerformanceSection({
  loading,
  employeeRows,
  chartConfig,
  formatMoney,
  formatNumber,
}) {
  return (
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
              <CartesianGrid
                horizontal={false}
                stroke="rgba(255,255,255,0.08)"
              />
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
                    <p className="text-[11px] text-[color:var(--crm-muted)]">
                      lead
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
