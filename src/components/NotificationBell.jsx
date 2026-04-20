import { Bell, CheckCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../hooks/useNotification";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const NotificationBell = ({ isCollapsed = false, inSidebar = false }) => {
  const { t } = useTranslation();
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
        <button
          className={`relative transition-colors ${
            inSidebar
              ? `flex w-full items-center rounded-[22px] border border-transparent bg-transparent text-slate-400 hover:border-white/8 hover:bg-white/[0.05] hover:text-white data-[state=open]:border-white/14 data-[state=open]:bg-[linear-gradient(180deg,rgba(111,170,255,0.18),rgba(111,170,255,0.08))] data-[state=open]:text-white ${
                  isCollapsed
                    ? "flex-col justify-center gap-1 px-0 py-3"
                    : "flex-row justify-start gap-2.5 px-3 py-3"
                }`
              : "flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          }`}
        >
          <Bell size={18} />
          {inSidebar && (
            <span
              className={`${isCollapsed ? "text-[10px]" : "text-sm"} font-medium`}
            >
              {t("notification.title")}
            </span>
          )}
          {unreadCount > 0 && (
            <span
              className={`absolute flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ${
                inSidebar
                  ? isCollapsed
                    ? "top-1.5 right-2"
                    : "top-2.5 right-3"
                  : "top-1.5 right-1.5"
              }`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(360px,calc(100vw-1.5rem))] border-white/10 bg-[#0d1a28] p-0 text-white shadow-[0_24px_60px_rgba(0,0,0,0.38)]"
      >
        <div className="max-h-[480px] overflow-y-auto">
          <div className="sticky top-0 flex items-center justify-between border-b border-white/8 bg-[#102033] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                {t("notification.title")}
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
                {t("notification.markAllRead")}
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-slate-400">
              {t("common.loading")}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Bell className="mb-2 h-10 w-10 text-slate-500" />
              <span className="text-sm">{t("notification.noNotifications")}</span>
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
