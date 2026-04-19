import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/NotificationBell";

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
  "/analitika": "Analitika",
  "/companies": "Kompaniyalar",
  "/crm-market": "CRM Market",
};

export default function MobileHeader() {
  const location = useLocation();
  const { toggleSidebar } = useSidebar();
  const title = TITLES[location.pathname] || "CRM";
  const projectName = localStorage.getItem("projectName");

  return (
    <div className="flex md:hidden shrink-0 items-center gap-3 sticky top-0 z-30 border-b border-white/8 bg-[rgba(6,11,20,0.94)] px-4 py-3 backdrop-blur-xl">
      <button
        onClick={toggleSidebar}
        aria-label="Menyuni ochish"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
      >
        <Menu size={18} />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="text-sm font-semibold text-white truncate">{title}</h1>
        {projectName && (
          <p className="text-[10px] text-slate-500 truncate leading-none mt-0.5">
            {projectName}
          </p>
        )}
      </div>

      <div className="shrink-0">
        <NotificationBell />
      </div>
    </div>
  );
}
