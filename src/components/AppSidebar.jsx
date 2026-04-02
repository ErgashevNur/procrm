import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { Lock, Settings, ShoppingBag, Building2 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { NAV_ITEMS, ROLE_LABELS, ROLES, isSupportedRole } from "@/lib/rbac";
import { useNotification } from "@/hooks/useNotification";
import { NotificationBell } from "./NotificationBell";

const API_BASE = import.meta.env.VITE_VITE_API_KEY_PROHOME;

function getImageUrl(imgName) {
  if (!imgName) return null;
  if (imgName.startsWith("blob:") || imgName.startsWith("http")) return imgName;
  return `${API_BASE}/image/${imgName}`;
}

const SETTINGS_ROLES = [ROLES.ROP, ROLES.SUPERADMIN];

function navCls(isActive, isCollapsed, extra = "") {
  return [
    "flex items-center rounded-[22px] border no-underline transition-all duration-200",
    isCollapsed
      ? "flex-col justify-center gap-1 px-0 py-3"
      : "flex-row justify-start gap-3 px-4 py-3",
    isActive
      ? "border-white/14 bg-[linear-gradient(180deg,rgba(111,170,255,0.22),rgba(111,170,255,0.08))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_14px_28px_rgba(51,110,255,0.14)]"
      : "border-transparent text-slate-400 hover:border-white/8 hover:bg-white/[0.05] hover:text-white",
    extra,
  ].join(" ");
}

function profileCls(isActive, isCollapsed) {
  return [
    "mb-1 flex items-center rounded-[22px] border no-underline transition-all duration-200",
    isCollapsed
      ? "flex-col justify-center gap-1 px-0 py-3"
      : "flex-row justify-start gap-2.5 px-3 py-3",
    isActive
      ? "border-white/14 bg-[linear-gradient(180deg,rgba(111,170,255,0.18),rgba(111,170,255,0.08))] text-white"
      : "border-transparent text-slate-300 hover:border-white/8 hover:bg-white/[0.05]",
  ].join(" ");
}

function settingCls(isActive, isCollapsed) {
  return [
    "mb-1 flex items-center rounded-[22px] border no-underline transition-all duration-200",
    isCollapsed
      ? "flex-col justify-center gap-1 px-0 py-3"
      : "flex-row justify-start gap-2.5 px-3 py-3",
    isActive
      ? "border-white/14 bg-[linear-gradient(180deg,rgba(111,170,255,0.18),rgba(111,170,255,0.08))] text-white"
      : "border-transparent text-slate-400 hover:border-white/8 hover:bg-white/[0.05]",
  ].join(" ");
}

export default function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const {
    leadNotificationCount,
    taskNotificationCount,
    resetLeadNotificationCount,
    resetTaskNotificationCount,
  } = useNotification();

  let user = {};
  let role = null;
  try {
    const raw = localStorage.getItem("userData");
    if (raw) {
      const parsed = JSON.parse(raw);
      user = parsed.user || {};
      role = user.role || null;
    }
  } catch {}

  const avatarUrl = getImageUrl(user.img);
  const avatarLetter = (user.fullName || user.email || "U")[0].toUpperCase();
  const safeRole = isSupportedRole(role) ? role : ROLES.SALESMANAGER;

  // NAV_ITEMS dan rolga qarab filterlash + companies faqat SUPERADMIN uchun
  const visibleMenus = NAV_ITEMS.filter((item) => {
    if (!item.roles.includes(safeRole)) return false;
    if (item.url === "/companies" && safeRole !== ROLES.SUPERADMIN) return false;
    return true;
  });

  const roleLabel = ROLE_LABELS[safeRole] || safeRole;
  const canOpenSettings = SETTINGS_ROLES.includes(safeRole);
  const projectName = localStorage.getItem("projectName");

  useEffect(() => {
    if (location.pathname === "/leadlar") {
      resetLeadNotificationCount();
    }
    if (location.pathname === "/tasks") {
      resetTaskNotificationCount();
    }
  }, [
    location.pathname,
    resetLeadNotificationCount,
    resetTaskNotificationCount,
  ]);

  return (
    <div
      className={`${
        isCollapsed ? "w-20" : "w-59"
      } crm-hairline relative isolate z-20 flex h-svh shrink-0 flex-col self-start overflow-hidden border-r border-white/8 bg-[linear-gradient(180deg,rgba(12,20,32,0.96),rgba(7,13,24,0.88))] shadow-[24px_0_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition-[width] duration-250 ease-in-out`}
    >
      {/* TOP */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Profile link */}
        <div className="border-b border-white/6 px-2 pt-2 pb-3">
          <NavLink
            to="/profile"
            className={({ isActive }) => profileCls(isActive, isCollapsed)}
          >
            {/* Avatar */}
            <div className="relative h-7 w-7 shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="h-full w-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full border border-slate-600 bg-[#1a2e40] text-xs font-semibold text-slate-300">
                  {avatarLetter}
                </div>
              )}
            </div>

            {isCollapsed ? (
              <span className="text-center text-[10px] leading-tight text-slate-400">
                {roleLabel.slice(0, 5) || "User"}
              </span>
            ) : (
              <div className="min-w-0">
                <div className="overflow-hidden text-[13px] font-medium text-ellipsis whitespace-nowrap text-slate-200">
                  {user.fullName || user.role || "User"}
                </div>
                <div className="overflow-hidden text-[11px] text-ellipsis whitespace-nowrap text-slate-500">
                  {roleLabel}
                </div>
              </div>
            )}
          </NavLink>
          {!isCollapsed && (
            <div className="mt-2 rounded-2xl border border-cyan-300/18 bg-cyan-400/8 px-3 py-2 text-[11px] text-cyan-100 backdrop-blur-xl">
              {projectName || "Loyiha tanlanmagan"}
            </div>
          )}
        </div>

        {/* Menu items */}
        <nav className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-2 py-3">
          {visibleMenus.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              className={({ isActive }) =>
                navCls(isActive, isCollapsed, "mx-0 my-0.5")
              }
            >
              <div className="relative shrink-0">
                <item.icon size={isCollapsed ? 22 : 18} className="shrink-0" />
                {((item.url === "/leadlar" && leadNotificationCount > 0) ||
                  (item.url === "/tasks" && taskNotificationCount > 0)) && (
                  <span
                    className={`absolute -top-2 ${
                      isCollapsed ? "right-[-10px]" : "right-[-12px]"
                    } flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#0e1a29] bg-[#f2416b] px-1 text-[10px] font-bold text-white shadow-[0_6px_14px_rgba(242,65,107,0.35)]`}
                  >
                    {item.url === "/leadlar"
                      ? leadNotificationCount > 99
                        ? "99+"
                        : leadNotificationCount
                      : taskNotificationCount > 99
                        ? "99+"
                        : taskNotificationCount}
                  </span>
                )}
              </div>
              <div
                className={`flex min-w-0 items-center ${
                  isCollapsed
                    ? "flex-col gap-1"
                    : "flex-1 justify-between gap-3"
                }`}
              >
                <span
                  className={`leading-tight font-medium whitespace-nowrap ${
                    isCollapsed
                      ? "text-center text-[10px]"
                      : "text-left text-sm"
                  }`}
                >
                  {item.title}
                </span>
              </div>
            </NavLink>
          ))}

          {/* Beta versiya */}
          <div title="Tez kunda ochiladi...">
            <NavLink
              to="/crm-market"
              end
              className={({ isActive }) =>
                navCls(isActive, isCollapsed, "mx-0 my-0.5")
              }
            >
              <div className="relative shrink-0">
                <ShoppingBag
                  size={isCollapsed ? 22 : 18}
                  className="shrink-0"
                />
                {isCollapsed && (
                  <span className="absolute -top-1.5 -right-6 rounded border border-amber-400/30 bg-amber-400/20 px-0.5 py-px text-[7px] leading-none font-bold text-amber-400">
                    BETA
                  </span>
                )}
              </div>
              <span
                className={`flex items-center gap-1.5 leading-tight font-medium whitespace-nowrap ${
                  isCollapsed ? "text-center text-[10px]" : "text-left text-sm"
                }`}
              >
                CRM Market
                {!isCollapsed && (
                  <span className="rounded border border-amber-400/30 bg-amber-400/20 px-1 py-0.5 text-[9px] leading-none font-semibold text-amber-400">
                    BETA
                  </span>
                )}
              </span>
            </NavLink>
          </div>
          {/* Beta versiya */}
        </nav>
      </div>

      {/* BOTTOM */}
      <div className="relative z-10 bg-[linear-gradient(180deg,rgba(12,20,32,0.96),rgba(7,13,24,0.94))] p-2">
        {canOpenSettings && (
          <NavLink
            to="/setting"
            className={({ isActive }) => settingCls(isActive, isCollapsed)}
          >
            <Settings size={isCollapsed ? 22 : 18} className="shrink-0" />
            <span
              className={`${isCollapsed ? "text-[10px]" : "text-sm"} font-medium`}
            >
              Sozlamalar
            </span>
          </NavLink>
        )}

        <div className="my-1 h-px bg-white/6" />

        <NotificationBell isCollapsed={isCollapsed} inSidebar />
      </div>
    </div>
  );
}