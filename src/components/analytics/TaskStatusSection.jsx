import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import EmptyState from "@/components/analytics/EmptyState";
import SectionHeader from "@/components/analytics/SectionHeader";
import SkeletonBlock from "@/components/analytics/SkeletonBlock";

export default function TaskStatusSection({
  loading,
  taskStats,
  taskDonutData,
  chartConfig,
  formatNumber,
  formatPercent,
  Activity,
  CircleCheckBig,
  Clock3,
  TriangleAlert,
}) {
  return (
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
            <ChartContainer
              className="mx-auto h-[260px] max-w-[280px]"
              config={chartConfig}
            >
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
                <p className="mt-2 text-sm font-medium text-white">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
