import { useSidebar } from "@/components/ui/sidebar";
import { LogOut, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  NAV_ITEMS,
  ROLE_LABELS,
  ROLES,
  isSupportedRole,
} from "@/lib/rbac";

const API_BASE = import.meta.env.VITE_VITE_API_KEY_PROHOME;

function getImageUrl(imgName) {
  if (!imgName) return null;
  if (imgName.startsWith("blob:") || imgName.startsWith("http")) return imgName;
  return `${API_BASE}/image/${imgName}`;
}

const SETTINGS_ROLES = [ROLES.ROP, ROLES.SUPERADMIN];

// NavLink className orqali active holat — inline style ishlatmaymiz
function navCls(isActive, isCollapsed, extra = "") {
  return [
    "flex items-center rounded-lg no-underline transition-colors duration-150",
    isCollapsed
      ? "flex-col justify-center gap-1 px-0 py-2.5"
      : "flex-row justify-start gap-3 px-4 py-2.5",
    isActive
      ? "bg-blue-600 text-white"
      : "text-slate-400 hover:bg-white/[0.07] hover:text-white",
    extra,
  ].join(" ");
}

function profileCls(isActive, isCollapsed) {
  return [
    "mb-1 flex items-center rounded-lg no-underline transition-colors duration-150",
    isCollapsed
      ? "flex-col justify-center gap-1 px-0 py-2.5"
      : "flex-row justify-start gap-2.5 px-3 py-2.5",
    isActive
      ? "bg-blue-600 text-white"
      : "text-slate-400 hover:bg-white/[0.07]",
  ].join(" ");
}

function settingCls(isActive, isCollapsed) {
  return [
    "mb-1 flex items-center rounded-lg no-underline transition-colors duration-150",
    isCollapsed
      ? "flex-col justify-center gap-1 px-0 py-2.5"
      : "flex-row justify-start gap-2.5 px-3 py-2.5",
    isActive
      ? "bg-blue-600 text-white"
      : "text-slate-400 hover:bg-white/[0.07]",
  ].join(" ");
}

export default function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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
  const visibleMenus = NAV_ITEMS.filter((item) => item.roles.includes(safeRole));
  const roleLabel = ROLE_LABELS[safeRole] || safeRole;
  const canOpenSettings = SETTINGS_ROLES.includes(safeRole);
  const projectName = localStorage.getItem("projectName");

  return (
    <div
      className={`${
        isCollapsed ? "w-20" : "w-[236px]"
      } sticky top-0 flex h-screen min-h-[80vh] flex-shrink-0 flex-col justify-between border-r border-white/8 bg-gradient-to-b from-[#081521] via-[#07131d] to-[#060f18] transition-[width] duration-[250ms] ease-in-out`}
    >
      {/* TOP */}
      <div>
        {/* Profile link */}
        <div className="border-b border-white/6 px-2 pt-2 pb-2">
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
            <div className="mt-1 rounded-md border border-cyan-400/15 bg-cyan-500/8 px-2 py-1 text-[11px] text-cyan-100">
              {projectName || "Loyiha tanlanmagan"}
            </div>
          )}
        </div>

        {/* Menu items */}
        <nav className="py-3">
          {visibleMenus.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              className={({ isActive }) =>
                navCls(isActive, isCollapsed, "mx-2 my-0.5")
              }
            >
              <item.icon
                size={isCollapsed ? 22 : 18}
                className="flex-shrink-0"
              />
              <span
                className={`leading-tight font-medium whitespace-nowrap ${
                  isCollapsed ? "text-center text-[10px]" : "text-left text-sm"
                }`}
              >
                {item.title}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* BOTTOM */}
      <div className="p-2">
        {canOpenSettings && (
          <NavLink
            to="/setting"
            className={({ isActive }) => settingCls(isActive, isCollapsed)}
          >
            <Settings size={isCollapsed ? 22 : 18} className="flex-shrink-0" />
            <span
              className={`${isCollapsed ? "text-[10px]" : "text-sm"} font-medium`}
            >
              Sozlamalar
            </span>
          </NavLink>
        )}

        <div className="my-1 h-px bg-white/[0.06]" />

        {/* Logout */}
        <NavLink
          to="/login"
          onClick={() => localStorage.clear()}
          className={`flex items-center rounded-lg text-slate-400 no-underline transition-colors duration-150 hover:bg-red-500/20 hover:text-red-400 ${
            isCollapsed
              ? "flex-col justify-center gap-1 px-0 py-2.5"
              : "flex-row justify-start gap-2.5 px-3 py-2.5"
          }`}
        >
          <LogOut size={isCollapsed ? 22 : 18} className="flex-shrink-0" />
          <span
            className={`${isCollapsed ? "text-[10px]" : "text-sm"} font-medium`}
          >
            Logout
          </span>
        </NavLink>
      </div>
    </div>
  );
}
