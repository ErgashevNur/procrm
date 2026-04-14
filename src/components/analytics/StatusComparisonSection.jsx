import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import EmptyState from "@/components/analytics/EmptyState";
import SectionHeader from "@/components/analytics/SectionHeader";
import SkeletonBlock from "@/components/analytics/SkeletonBlock";

export default function StatusComparisonSection({
  loading,
  rows,
  chartConfig,
  formatCompactMoney,
  formatMoney,
  formatNumber,
}) {
  return (
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
  );
}
