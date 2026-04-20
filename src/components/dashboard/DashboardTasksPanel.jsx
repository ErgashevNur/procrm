import { CalendarCheck2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import ArcProgress from "@/components/dashboard/ArcProgress";
import TaskRing from "@/components/dashboard/TaskRing";

export default function DashboardTasksPanel({ tasks }) {
  const { t } = useTranslation();
  return (
    <div
      className="crm-card"
      style={{
        animation: "fadeUp 0.5s ease 0.30s both",
      }}
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="crm-kicker">{t("dashboard.tasksTitle")}</p>
          <p className="mt-1 text-xs text-[color:var(--crm-muted)]">
            {t("dashboard.tasksDesc")}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5">
          <CalendarCheck2 size={11} className="text-blue-400" />
          <span className="text-xs font-bold text-white">{tasks.total}</span>
          <span className="text-[10px] text-[color:var(--crm-muted-2)]">{t("dashboard.total")}</span>
        </div>
      </div>

      {/* Completion rate big arc */}
      <div className="mb-5 flex items-center gap-5">
        <div className="relative shrink-0">
          <ArcProgress
            percent={tasks.completionRate}
            color="#22c55e"
            size={96}
            stroke={8}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg leading-none font-black text-white">
              {tasks.completionRate}%
            </span>
            <span className="mt-0.5 text-[9px] text-[color:var(--crm-muted)]">
              {t("dashboard.done")}
            </span>
          </div>
        </div>
        <div className="flex-1 space-y-2.5">
          {[
            {
              labelKey: "dashboard.completed",
              value: tasks.completed,
              color: "#22c55e",
              icon: CheckCircle2,
            },
            {
              labelKey: "dashboard.pending",
              value: tasks.pending,
              color: "#f59e0b",
              icon: Clock,
            },
            {
              labelKey: "dashboard.overdue",
              value: tasks.overdue,
              color: "#ef4444",
              icon: AlertTriangle,
            },
          ].map(({ labelKey, value, color, icon: Icon }) => (
            <div key={labelKey} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={12} style={{ color }} />
                <span className="text-xs text-[color:var(--crm-muted)]">{t(labelKey)}</span>
              </div>
              <span className="text-xs font-bold text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mini rings */}
      <div className="grid grid-cols-3 gap-2 border-t border-white/6 pt-4">
        <TaskRing
          label={t("dashboard.completed")}
          value={tasks.completed}
          total={tasks.total}
          color="#22c55e"
        />
        <TaskRing
          label={t("dashboard.pending")}
          value={tasks.pending}
          total={tasks.total}
          color="#f59e0b"
        />
        <TaskRing
          label={t("dashboard.overdue")}
          value={tasks.overdue}
          total={tasks.total}
          color="#ef4444"
        />
      </div>
    </div>
  );
}
