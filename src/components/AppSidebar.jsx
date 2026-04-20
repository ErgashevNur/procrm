import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { useUser } from "@/context/UserContext";
import { useTranslation } from "react-i18next";
import { Settings, ShoppingBag } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  MANAGEMENT_ROLES,
  NAV_ITEMS,
  ROLE_LABELS,
  ROLES,
  isSuperAdminLikeRole,
  isSupportedRole,
} from "@/lib/rbac";
import { useNotification } from "@/hooks/useNotification";
import { NotificationBell } from "./NotificationBell";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const API_BASE = import.meta.env.VITE_VITE_API_KEY_PROHOME;

function getImageUrl(imgName) {
  if (!imgName) return null;
  if (imgName.startsWith("blob:") || imgName.startsWith("http")) return imgName;
  return `${API_BASE}/image/${imgName}`;
}

const SETTINGS_ROLES = MANAGEMENT_ROLES;

function navCls(isActive, isCollapsed, extra = "") {
  return [
    "flex items-center rounded-[22px] border no-underline transition-all duration-200",
    isCollapsed
      ? "flex-col justify-center gap-1 px-0 py-3"
      : "flex-row justify-start gap-3 px-4 py-3",
    isActive
      ? "border-white/14 bg-[linear-gradient(180deg,rgba(111,170,255,0.22),rgba(111,170,255,0.08))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_14px_28px_rgba(51,110,255,0.14)]"
      : "border-transparent text-slate-400 hover:border-white/8 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40",
    extra,
  ].join(" ");
}

function profileCls(isActive, isCollapsed) {
  return [
    "mb-1 flex items-center rounded-[22px] border no-underline transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40",
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
    "mb-1 flex items-center rounded-[22px] border no-underline transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40",
    isCollapsed
      ? "flex-col justify-center gap-1 px-0 py-3"
      : "flex-row justify-start gap-2.5 px-3 py-3",
    isActive
      ? "border-white/14 bg-[linear-gradient(180deg,rgba(111,170,255,0.18),rgba(111,170,255,0.08))] text-white"
      : "border-transparent text-slate-400 hover:border-white/8 hover:bg-white/[0.05]",
  ].join(" ");
}

const NAV_TITLE_KEYS = {
  "/dashboard": "sidebar.dashboard",
  "/leadlar": "sidebar.leads",
  "/tasks": "sidebar.tasks",
  "/analitika": "sidebar.analytics",
  "/rassilka": "sidebar.smsRassilka",
  "/leadSource": "sidebar.leadSource",
  "/projects": "sidebar.projects",
  "/companies": "sidebar.companies",
  "/crm-market": "sidebar.crmMarket",
};

function SidebarBody({ isCollapsed }) {
  const { t } = useTranslation();
  const location = useLocation();
  const {
    leadNotificationCount,
    taskNotificationCount,
    resetLeadNotificationCount,
    resetTaskNotificationCount,
  } = useNotification();

  const { user } = useUser();
  const role = user.role || null;

  const avatarUrl = getImageUrl(user.img);
  const avatarLetter = (user.fullName || user.email || "U")[0].toUpperCase();
  const safeRole = isSupportedRole(role) ? role : ROLES.SALESMANAGER;

  const visibleMenus = NAV_ITEMS.filter((item) => {
    if (!item.roles.includes(safeRole)) return false;
    if (item.url === "/companies" && !isSuperAdminLikeRole(safeRole)) return false;
    return true;
  });

  const roleLabel = ROLE_LABELS[safeRole] || safeRole;
  const canOpenSettings = SETTINGS_ROLES.includes(safeRole);
  const projectName = localStorage.getItem("projectName");

  useEffect(() => {
    if (location.pathname === "/leadlar") resetLeadNotificationCount();
    if (location.pathname === "/tasks") resetTaskNotificationCount();
  }, [location.pathname, resetLeadNotificationCount, resetTaskNotificationCount]);

  return (
    <div className="flex h-full flex-col">
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
                    e.currentTarget.parentElement.innerHTML = `<div class="flex h-full w-full items-center justify-center rounded-full border border-slate-600 bg-[#1a2e40] text-xs font-semibold text-slate-300">${avatarLetter}</div>`;
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
              {projectName || t("sidebar.noProject")}
            </div>
          )}
        </div>

        {/* Menu items */}
        <nav
          className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-2 py-3"
          aria-label="Asosiy menyu"
        >
          {visibleMenus.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              aria-label={item.title}
              className={({ isActive }) =>
                navCls(isActive, isCollapsed, "mx-0 my-0.5")
              }
            >
              <div className="relative shrink-0">
                <item.icon size={isCollapsed ? 22 : 18} className="shrink-0" aria-hidden="true" />
                {((item.url === "/leadlar" && leadNotificationCount > 0) ||
                  (item.url === "/tasks" && taskNotificationCount > 0)) && (
                  <span
                    className={`absolute -top-2 ${
                      isCollapsed ? "-right-2.5" : "-right-3"
                    } flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#0e1a29] bg-[#f2416b] px-1 text-[10px] font-bold text-white shadow-[0_6px_14px_rgba(242,65,107,0.35)]`}
                    aria-label={`${item.url === "/leadlar" ? leadNotificationCount : taskNotificationCount} yangi`}
                  >
                    {item.url === "/leadlar"
                      ? leadNotificationCount > 99 ? "99+" : leadNotificationCount
                      : taskNotificationCount > 99 ? "99+" : taskNotificationCount}
                  </span>
                )}
              </div>
              <div
                className={`flex min-w-0 items-center ${
                  isCollapsed ? "flex-col gap-1" : "flex-1 justify-between gap-3"
                }`}
              >
                <span
                  className={`leading-tight font-medium whitespace-nowrap ${
                    isCollapsed ? "text-center text-[10px]" : "text-left text-sm"
                  }`}
                >
                  {NAV_TITLE_KEYS[item.url] ? t(NAV_TITLE_KEYS[item.url]) : item.title}
                </span>
              </div>
            </NavLink>
          ))}

          {/* Beta versiya */}
          <div title="Tez kunda ochiladi...">
            <NavLink
              to="/crm-market"
              end
              aria-label="CRM Market — Beta"
              className={({ isActive }) =>
                navCls(isActive, isCollapsed, "mx-0 my-0.5")
              }
            >
              <div className="relative shrink-0">
                <ShoppingBag size={isCollapsed ? 22 : 18} className="shrink-0" aria-hidden="true" />
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
        </nav>
      </div>

      {/* BOTTOM */}
      <div className="relative z-10 bg-[linear-gradient(180deg,rgba(12,20,32,0.96),rgba(7,13,24,0.94))] p-2">
        {canOpenSettings && (
          <NavLink
            to="/setting"
            className={({ isActive }) => settingCls(isActive, isCollapsed)}
          >
            <Settings size={isCollapsed ? 22 : 18} className="shrink-0" aria-hidden="true" />
            <span
              className={`${isCollapsed ? "text-[10px]" : "text-sm"} font-medium`}
            >
              {t("common.settings")}
            </span>
          </NavLink>
        )}

        <div className="my-1 h-px bg-white/8" />

        <NotificationBell isCollapsed={isCollapsed} inSidebar />
      </div>
    </div>
  );
}

export default function AppSidebar() {
  const { state, isMobile, openMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="p-0 w-65 border-white/10 bg-[linear-gradient(180deg,rgba(10,17,28,0.99),rgba(6,11,20,0.98))] backdrop-blur-2xl"
        >
          <SidebarBody isCollapsed={false} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={`${
        isCollapsed ? "w-20" : "w-59"
      } crm-hairline relative isolate z-20 hidden h-svh shrink-0 flex-col self-start overflow-hidden border-r border-white/8 bg-[linear-gradient(180deg,rgba(12,20,32,0.96),rgba(7,13,24,0.88))] shadow-[24px_0_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl transition-[width] duration-250 ease-in-out md:flex`}
    >
      <SidebarBody isCollapsed={isCollapsed} />
    </div>
  );
}
