import { TrendingUp, Users, CalendarCheck2, BarChart3 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

export default function DashboardStatCards({ totalLeads, daily, weekly, monthly }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        icon={Users}
        label="Jami Leadlar"
        value={totalLeads}
        note="Umumiy tushgan leadlar soni."
        color="#3b82f6"
        delay={0.05}
      />
      <StatCard
        icon={TrendingUp}
        label="Bugun"
        value={daily}
        note="Bugun nechta lead tushgani."
        color="#22c55e"
        delay={0.1}
      />
      <StatCard
        icon={BarChart3}
        label="Bu hafta"
        value={weekly}
        note="Shu haftada nechta lead tushgani."
        color="#f59e0b"
        delay={0.15}
      />
      <StatCard
        icon={CalendarCheck2}
        label="Bu oy"
        value={monthly}
        note="Shu oyda nechta lead tushgani."
        color="#a78bfa"
        delay={0.2}
      />
    </div>
  );
}
