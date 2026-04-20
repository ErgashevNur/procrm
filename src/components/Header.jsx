import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROLE_LABELS, ROLES, getCurrentRole, isSupportedRole } from "@/lib/rbac";

export default function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const role = getCurrentRole();
  const safeRole = isSupportedRole(role) ? role : ROLES.SALESMANAGER;
  const projectName = localStorage.getItem("projectName");
  const roleLabel = ROLE_LABELS[safeRole] || safeRole;

  const TITLES = {
    "/dashboard": t("header.dashboard"),
    "/leadlar": t("header.leads"),
    "/tasks": t("header.tasks"),
    "/leadSource": t("header.leadSources"),
    "/projects": t("header.projects"),
    "/status": t("header.statuses"),
    "/addStatus": t("header.addStatus"),
    "/rassilka": t("header.smsRassilka"),
    "/setting": t("header.settings"),
    "/profile": t("header.profile"),
    "/kanban": t("header.kanban"),
    "/leadDetails": t("header.leadDetails"),
    "/analitika": t("header.analytics"),
    "/companies": t("header.companies"),
    "/crm-market": t("header.crmMarket"),
  };

  const title = TITLES[location.pathname] || "CRM";

  return (
    <div className="crm-glass crm-hairline hidden w-full items-center justify-between gap-4 rounded-[28px] px-5 py-3 md:flex">
      <div className="min-w-0">
        <h1 className="text-sm font-semibold text-white truncate">{title}</h1>
        {projectName && (
          <p className="mt-0.5 text-[11px] text-slate-500 truncate leading-none">
            {projectName}
          </p>
        )}
      </div>
      <div className="shrink-0 rounded-xl border border-white/8 bg-white/4 px-3 py-1.5">
        <span className="text-[11px] font-medium text-slate-400">{roleLabel}</span>
      </div>
    </div>
  );
}
