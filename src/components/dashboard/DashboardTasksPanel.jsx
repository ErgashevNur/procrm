import { CalendarCheck2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import ArcProgress from "@/components/dashboard/ArcProgress";
import TaskRing from "@/components/dashboard/TaskRing";

export default function DashboardTasksPanel({ tasks }) {
  return (
    <div
      className="crm-card"
      style={{
        animation: "fadeUp 0.5s ease 0.30s both",
      }}
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="crm-kicker">Tasklar</p>
          <p className="mt-1 text-xs text-[color:var(--crm-muted)]">
            Vazifalar holati shu yerda ko'rinadi.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5">
          <CalendarCheck2 size={11} className="text-blue-400" />
          <span className="text-xs font-bold text-white">{tasks.total}</span>
          <span className="text-[10px] text-[color:var(--crm-muted-2)]">jami</span>
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
              bajarildi
            </span>
          </div>
        </div>
        <div className="flex-1 space-y-2.5">
          {[
            {
              label: "Bajarilgan",
              value: tasks.completed,
              color: "#22c55e",
              icon: CheckCircle2,
            },
            {
              label: "Kutilmoqda",
              value: tasks.pending,
              color: "#f59e0b",
              icon: Clock,
            },
            {
              label: "Muddati o'tgan",
              value: tasks.overdue,
              color: "#ef4444",
              icon: AlertTriangle,
            },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={12} style={{ color }} />
                <span className="text-xs text-[color:var(--crm-muted)]">{label}</span>
              </div>
              <span className="text-xs font-bold text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mini rings */}
      <div className="grid grid-cols-3 gap-2 border-t border-white/6 pt-4">
        <TaskRing
          label="Bajarilgan"
          value={tasks.completed}
          total={tasks.total}
          color="#22c55e"
        />
        <TaskRing
          label="Kutilmoqda"
          value={tasks.pending}
          total={tasks.total}
          color="#f59e0b"
        />
        <TaskRing
          label="Muddati o'tgan"
          value={tasks.overdue}
          total={tasks.total}
          color="#ef4444"
        />
      </div>
    </div>
  );
}
