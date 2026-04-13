import {
  AlertCircle,
  Ban,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import SourceIcon from "./SourceIcon";
import SortIcon from "./SortIcon";

export default function TasksTableView({
  filtered,
  handleSort,
  sortBy,
  sortDir,
  handleToggle,
  handleCancelTask,
  setPreviewTask,
  TYPES,
  API_STATUSES,
  isOverdue,
  formatDate,
  formatPhone,
  getImageUrl,
}) {
  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <CheckCircle2 size={40} className="text-gray-700" />
        <p className="text-sm font-medium text-gray-500">Vazifalar topilmadi</p>
        <p className="text-xs text-gray-700">Filter o'zgartiring yoki yangi vazifa qo'shing</p>
      </div>
    );
  }

  return (
    <table className="w-full min-w-[860px] border-collapse">
      <thead>
        <tr className="border-b border-white/5">
          {[
            { key: "status", label: "Holat" },
            { key: "lead", label: "Mijoz" },
            { key: "description", label: "Vazifa" },
            { key: "taskDate", label: "Sana" },
            { key: "assignedUser", label: "Mas'ul" },
            { key: "remaining", label: "Qoldi" },
          ].map((col) => (
            <th
              key={col.key}
              onClick={() => handleSort(col.key)}
              className="cursor-pointer px-4 py-3 text-left text-[11px] font-medium tracking-wider text-gray-600 uppercase transition-colors select-none hover:text-gray-300"
            >
              <div className="flex items-center gap-1.5">
                {col.label}
                <SortIcon field={col.key} sortBy={sortBy} dir={sortDir} />
              </div>
            </th>
          ))}
          <th className="w-8 px-4 py-3" />
        </tr>
      </thead>
      <tbody>
        {filtered.map((task, i) => {
          const isDone = task.status === "FINISHED";
          const isCanceled = task.status === "CANCELED";
          const isResolved = isDone || isCanceled;
          const overdue = isOverdue(task.taskDate, task.status);
          const type = TYPES[task.type] || TYPES.task;
          const statusInfo = API_STATUSES[task.status] || {
            label: "Noma'lum",
            color: "#6b7280",
          };
          const lead = task.leads;
          const leadName = lead
            ? `${lead.firstName || ""} ${lead.lastName || ""}`.trim()
            : null;
          const leadPhone = lead?.phone;
          const leadSource = lead?.leadSource;
          const leadStatus = lead?.status;
          const assignedUser = lead?.assignedUser || task.assignedUser;
          const remaining = task.taskRemainingDays ?? lead?.taskRemainingDays;

          return (
            <tr
              key={task.id}
              className={`group border-b border-white/[0.03] transition-colors hover:bg-white/[0.02] ${isResolved ? "opacity-60" : ""} ${isCanceled ? "bg-red-500/[0.03]" : ""}`}
              style={{ animation: `taskIn .25s ease ${i * 0.03}s both` }}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(task)}
                    className="shrink-0 transition-transform hover:scale-110"
                  >
                    {isDone ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Circle size={16} className="text-gray-600 hover:text-blue-400" />
                    )}
                  </button>
                  <span
                    className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      color: statusInfo.color,
                      background: `${statusInfo.color}18`,
                    }}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  {leadName ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <Avatar name={leadName} size={5} />
                        <Link
                          to={`/leadDetails?leadId=${lead?.id}`}
                          className={`text-sm font-medium transition-colors hover:underline ${
                            isCanceled
                              ? "text-red-300/80 line-through decoration-red-400/70"
                              : isDone
                                ? "text-gray-500 line-through"
                                : "text-white"
                          }`}
                        >
                          {leadName}
                        </Link>
                        {leadStatus && (
                          <span
                            className="rounded px-1.5 py-px text-[9px] font-semibold"
                            style={{
                              color: leadStatus.color || "#94a3b8",
                              background: `${leadStatus.color || "#94a3b8"}20`,
                            }}
                          >
                            {leadStatus.name}
                          </span>
                        )}
                      </div>
                      {leadPhone && (
                        <a
                          href={`tel:${leadPhone}`}
                          className="flex items-center gap-1 text-[10px] text-gray-600 transition-colors hover:text-blue-400"
                        >
                          <Phone size={9} />
                          {formatPhone(leadPhone)}
                        </a>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-gray-600">—</span>
                  )}
                </div>
              </td>

              <td className="px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
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
                    <span className="block max-w-[420px] truncate">
                      {task.description || "—"}
                    </span>
                  </button>
                </div>
                {leadSource && (
                  <div className="mt-1 flex items-center gap-1">
                    <SourceIcon source={leadSource} getImageUrl={getImageUrl} />
                    <span className="text-[10px] text-gray-600">{leadSource.name}</span>
                  </div>
                )}
              </td>

              <td className="px-4 py-3">
                <div
                  className={`flex items-center gap-1.5 text-xs ${overdue ? "text-red-400" : "text-gray-500"}`}
                >
                  {overdue && <AlertCircle size={10} />}
                  <Calendar size={10} />
                  {formatDate(task.taskDate)}
                </div>
              </td>

              <td className="px-4 py-3">
                {assignedUser?.fullName ? (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-[9px] font-bold text-blue-400">
                      {assignedUser.fullName[0]}
                    </div>
                    {assignedUser.fullName}
                  </div>
                ) : (
                  <span className="text-xs text-gray-700">—</span>
                )}
              </td>

              <td className="px-4 py-3">
                {isDone ? (
                  <span className="text-[10px] text-green-500">✓ Tugadi</span>
                ) : isCanceled ? (
                  <span className="text-[10px] text-red-400">Bekor qilingan</span>
                ) : overdue ? (
                  <span className="text-[10px] text-red-400">Kechikdi</span>
                ) : remaining != null && remaining > 0 ? (
                  <div
                    className={`flex items-center gap-1 text-xs ${remaining <= 1 ? "text-red-400" : "text-gray-500"}`}
                  >
                    <Clock size={10} />
                    {remaining} kun
                  </div>
                ) : (
                  <span className="text-xs text-gray-700">—</span>
                )}
              </td>

              <td className="px-4 py-3">
                <button
                  onClick={() => handleCancelTask(task)}
                  disabled={task.status === "CANCELED"}
                  className="text-gray-700 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Ban size={13} />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
