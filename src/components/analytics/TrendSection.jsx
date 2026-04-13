import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import EmptyState from "@/components/analytics/EmptyState";
import SectionHeader from "@/components/analytics/SectionHeader";
import SkeletonBlock from "@/components/analytics/SkeletonBlock";

export default function TrendSection({
  loading,
  chartConfig,
  TREND_TABS,
  trendType,
  setTrendType,
  trendRange,
  setTrendRange,
  trendRows,
  hasTrendBudget,
  trendLeadTicks,
  formatCompactMoney,
  formatMoney,
  formatNumber,
}) {
  return (
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
              activeDot={{
                r: 6,
                strokeWidth: 2,
                fill: "#69a7ff",
                stroke: "#ffffff",
              }}
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
  );
}
