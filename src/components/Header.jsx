import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { BadgeCheck, LogOut, Settings, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROLE_LABELS, ROLES, getCurrentRole, isSupportedRole } from "@/lib/rbac";

const TITLES = {
  "/dashboard": "Dashboard",
  "/leadlar": "Leadlar",
  "/tasks": "Tasklar",
  "/leadSource": "Lead manbalari",
  "/projects": "Projectlar",
  "/status": "Statuslar",
  "/addStatus": "Status qo'shish",
  "/rassilka": "SMS / Rassilka",
  "/setting": "Sozlamalar",
  "/profile": "Profil",
  "/kanban": "Kanban",
  "/leadDetails": "Lead tafsiloti",
};

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getCurrentRole();
  const safeRole = isSupportedRole(role) ? role : ROLES.SALESMANAGER;
  const canOpenSettings = [ROLES.SUPERADMIN, ROLES.ROP].includes(safeRole);
  const title = TITLES[location.pathname] || "CRM";
  const projectName = localStorage.getItem("projectName");

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    navigate("/login");
  };

  const handleNavigate = (e) => {
    e.preventDefault();

    navigate("/profile");
  };

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-wide text-white">
          {title}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
            <BadgeCheck size={12} />
            {ROLE_LABELS[safeRole]}
          </span>
          {projectName && (
            <span className="truncate rounded-full border border-cyan-400/20 bg-cyan-500/8 px-2 py-0.5 text-cyan-200">
              {projectName}
            </span>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#10263a] px-2 py-2"
          render={<Button variant="outline" />}
        >
          <User className="text-gray-100 hover:text-gray-300" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 bg-[#0f2030] text-white">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Hisob</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleNavigate}>
              <div className="flex items-center gap-2 text-sm">
                <User size={16} />
                Profil
              </div>
            </DropdownMenuItem>
            {canOpenSettings && (
              <DropdownMenuItem onClick={() => navigate("/setting")}>
                <div className="flex items-center gap-2 text-sm">
                  <Settings size={16} />
                  Sozlamalar
                </div>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <div className="flex items-center gap-2 text-sm text-red-300">
                <LogOut size={16} />
                Chiqish
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
