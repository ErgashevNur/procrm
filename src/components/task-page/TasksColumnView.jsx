import {
  AlertCircle,
  Ban,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Phone,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";

export default function TasksColumnView({
  sortedColumns,
  TYPES,
  API_STATUSES,
  handleToggle,
  handleCancelTask,
  setPreviewTask,
  isOverdue,
  formatDate,
  formatPhone,
}) {
  return (
    <div className="grid min-w-[980px] grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {[
        {
          key: "past",
          label: "O'tgan vazifalar",
          color: "#ef4444",
          tasks: sortedColumns.pastTasks,
        },
        {
          key: "today",
          label: "Bugungi vazifalar",
          color: "#0ea5e9",
          tasks: sortedColumns.todayTasks,
        },
        {
          key: "future",
          label: "Kelgusi vazifalar",
          color: "#22c55e",
          tasks: sortedColumns.futureTasks,
        },
      ].map((column) => {
        const columnTasks = Array.isArray(column.tasks) ? column.tasks : [];
        return (
          <div
            key={column.key}
            className="rounded-xl border border-white/5 bg-white/[0.02]"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: column.color }}
                />
                <p className="text-xs font-semibold" style={{ color: column.color }}>
                  {column.label}
                </p>
              </div>
              <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">
                {columnTasks.length}
              </span>
            </div>
            <div className="flex max-h-[calc(100vh-270px)] flex-col gap-2 overflow-auto p-3">
              {columnTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-xs text-gray-600">
                  Vazifa yo'q
                </div>
              ) : (
                columnTasks.map((task, i) => {
                  const isDone = task.status === "FINISHED";
                  const isCanceled = task.status === "CANCELED";
                  const isResolved = isDone || isCanceled;
                  const overdue = isOverdue(task.taskDate, task.status);
                  const type = TYPES[task.type] || TYPES.task;
                  const lead = task.leads;
                  const leadName = lead
                    ? `${lead.firstName || ""} ${lead.lastName || ""}`.trim()
                    : null;
                  const leadPhone = lead?.phone;
                  const assignedUser = lead?.assignedUser || task.assignedUser;
                  const remaining = task.taskRemainingDays ?? lead?.taskRemainingDays;

                  return (
                    <div
                      key={task.id}
                      className={`group rounded-xl border border-white/5 bg-[#0a1d30] p-3 transition-colors hover:border-white/15 ${isResolved ? "opacity-60" : ""} ${isCanceled ? "border-red-500/20 bg-red-500/[0.04]" : ""}`}
                      style={{
                        animation: `taskIn .25s ease ${i * 0.03}s both`,
                      }}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <button
                          onClick={() => handleToggle(task)}
                          className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                        >
                          {isDone ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : (
                            <Circle size={16} className="text-gray-600 hover:text-blue-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCancelTask(task)}
                          disabled={task.status === "CANCELED"}
                          className="text-gray-700 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Ban size={13} />
                        </button>
                      </div>

                      <div className="mb-2 flex min-w-0 items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{
                            background: type.color,
                            boxShadow: `0 0 5px ${type.color}`,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewTask(task)}
                          className={`text-left text-sm transition-colors hover:text-white hover:underline ${
                            isCanceled
                              ? "text-red-300/80 line-through decoration-red-400/70"
                              : isDone
                                ? "text-gray-500 line-through"
                                : "text-gray-200"
                          }`}
                          title={task.description || ""}
                        >
                          <span className="block truncate">{task.description || "—"}</span>
                        </button>
                        <span
                          className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold"
                          style={{
                            color: API_STATUSES[task.status]?.color || "#6b7280",
                            background: `${API_STATUSES[task.status]?.color || "#6b7280"}20`,
                          }}
                        >
                          {API_STATUSES[task.status]?.label || "Kutilmoqda"}
                        </span>
                      </div>

                      {leadName && (
                        <div className="mb-2 flex items-center gap-1.5">
                          <Avatar name={leadName} size={5} />
                          <Link
                            to={`/leadDetails?leadId=${lead?.id}`}
                            className="text-xs text-gray-300 transition-colors hover:text-white hover:underline"
                          >
                            {leadName}
                          </Link>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                        <span className={`flex items-center gap-1 ${overdue ? "text-red-400" : ""}`}>
                          {overdue && <AlertCircle size={10} />}
                          <Calendar size={10} />
                          {formatDate(task.taskDate)}
                        </span>
                        {remaining != null && !isResolved && (
                          <span
                            className={`flex items-center gap-1 ${remaining <= 1 ? "text-red-400" : ""}`}
                          >
                            <Clock size={10} />
                            {remaining > 0 ? `${remaining} kun` : "Bugun"}
                          </span>
                        )}
                        {leadPhone && (
                          <a
                            href={`tel:${leadPhone}`}
                            className="flex items-center gap-1 transition-colors hover:text-blue-400"
                          >
                            <Phone size={10} />
                            {formatPhone(leadPhone)}
                          </a>
                        )}
                        {assignedUser?.fullName && (
                          <span className="flex items-center gap-1">
                            <User size={10} />
                            {assignedUser.fullName}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
