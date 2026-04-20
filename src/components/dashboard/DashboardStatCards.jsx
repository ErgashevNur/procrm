import { TrendingUp, Users, CalendarCheck2, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatCard from "@/components/dashboard/StatCard";

export default function DashboardStatCards({ totalLeads, daily, weekly, monthly }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        icon={Users}
        label={t("dashboard.statCards.totalLeads")}
        value={totalLeads}
        note={t("dashboard.statCards.totalNote")}
        color="#3b82f6"
        delay={0.05}
      />
      <StatCard
        icon={TrendingUp}
        label={t("dashboard.statCards.today")}
        value={daily}
        note={t("dashboard.statCards.todayNote")}
        color="#22c55e"
        delay={0.1}
      />
      <StatCard
        icon={BarChart3}
        label={t("dashboard.statCards.thisWeek")}
        value={weekly}
        note={t("dashboard.statCards.weekNote")}
        color="#f59e0b"
        delay={0.15}
      />
      <StatCard
        icon={CalendarCheck2}
        label={t("dashboard.statCards.thisMonth")}
        value={monthly}
        note={t("dashboard.statCards.monthNote")}
        color="#a78bfa"
        delay={0.2}
      />
    </div>
  );
}
