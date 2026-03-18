import { Bell, CheckCheck } from "lucide-react";
import { useNotification } from "../hooks/useNotification";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    loading,
    handleMarkAsRead,
    handleMarkAllAsRead,
  } = useNotification();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[360px] border-white/10 bg-[#0d1a28] p-0 text-white shadow-[0_24px_60px_rgba(0,0,0,0.38)]"
      >
        <div className="max-h-[480px] overflow-y-auto">
          <div className="sticky top-0 flex items-center justify-between border-b border-white/8 bg-[#102033] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                Bildirishnomalar
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200"
              >
                <CheckCheck size={14} />
                Hammasini o'qildi
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-slate-400">
              Yuklanmoqda...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Bell className="mb-2 h-10 w-10 text-slate-500" />
              <span className="text-sm">Bildirishnoma yo'q</span>
            </div>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  className={`flex items-start gap-3 border-b border-white/6 px-4 py-3 transition-colors ${
                    !n.isRead
                      ? "cursor-pointer bg-cyan-400/8 hover:bg-cyan-400/12"
                      : "cursor-default bg-transparent"
                  }`}
                >
                  <div className="mt-1.5 flex-shrink-0">
                    <div
                      className={`h-2 w-2 rounded-full ${n.isRead ? "bg-transparent" : "bg-cyan-400"}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${n.isRead ? "font-normal text-slate-300" : "font-semibold text-white"}`}
                    >
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {new Date(n.createdAt).toLocaleString("uz-UZ")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
