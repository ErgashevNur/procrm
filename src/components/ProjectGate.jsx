import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { MANAGEMENT_ROLES, getCurrentRole } from "@/lib/rbac";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

function saveProject(project) {
  localStorage.setItem("projectId", String(project.id));
  localStorage.setItem("projectName", project.name || "");
}

export default function ProjectGate({ children }) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = getCurrentRole();
  const canManageProjects = MANAGEMENT_ROLES.includes(role);

  useEffect(() => {
    const token = localStorage.getItem("user");
    if (!token) {
      setLoading(false);
      setError("Token topilmadi, qaytadan tizimga kiring.");
      return;
    }

    const loadProjects = async () => {
      try {
        const res = await fetch(`${API}/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const savedProjectId = localStorage.getItem("projectId");

        if (
          savedProjectId &&
          list.some((p) => String(p.id) === String(savedProjectId))
        ) {
          setReady(true);
          return;
        }

        if (list.length > 0) {
          saveProject(list[0]);
          setReady(true);
          return;
        }
      } catch {
        setError("Loyihalarni yuklashda xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  if (ready) return children;

  return (
    <div className="crm-page flex items-center justify-center">
      <div className="crm-card crm-hairline w-full max-w-2xl p-6 md:p-8">
        <div className="mb-6">
          <p className="crm-kicker">
            Workspace Setup
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
            CRM ishga tushmoqda
          </h2>
          <p className="mt-2 text-sm text-[color:var(--crm-muted)]">
            Loyiha avtomatik aniqlanmoqda. Iltimos kuting.
          </p>
        </div>

        {loading ? (
          <div className="crm-glass-subtle flex items-center gap-3 rounded-[24px] p-5 text-slate-200">
            <Loader2 size={18} className="animate-spin" />
            Loyihalar yuklanmoqda...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-4 text-sm text-red-300">
            {error}
          </div>
        ) : (
          <div className="crm-glass-subtle rounded-[24px] p-5">
            <p className="text-sm text-slate-200">
              Sizga biriktirilgan loyiha topilmadi.
            </p>
            {canManageProjects ? (
              <Link
                to="/projects"
                className="mt-4 inline-flex items-center rounded-full bg-[linear-gradient(180deg,rgba(127,179,255,0.95),rgba(84,143,255,0.95))] px-4 py-2 text-sm font-medium text-white shadow-[0_16px_34px_rgba(79,128,255,0.32)] hover:brightness-105"
              >
                Loyiha yaratish
              </Link>
            ) : (
              <p className="mt-2 text-xs text-[color:var(--crm-muted-2)]">
                Direktor bilan bog‘lanib, loyihaga biriktirishni so‘rang.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
