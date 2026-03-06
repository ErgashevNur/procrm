import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getCurrentRole, ROLES } from "@/lib/rbac";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

function saveProject(project) {
  localStorage.setItem("projectId", String(project.id));
  localStorage.setItem("projectName", project.name || "");
}

export default function ProjectGate({ children }) {
  const [ready, setReady] = useState(!!localStorage.getItem("projectId"));
  const [loading, setLoading] = useState(!ready);
  const [error, setError] = useState("");
  const role = getCurrentRole();
  const canManageProjects = [ROLES.ROP, ROLES.SUPERADMIN].includes(role);

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
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d2236] p-6 shadow-2xl md:p-8">
        <div className="mb-6">
          <p className="text-xs tracking-[0.18em] text-slate-500 uppercase">
            Workspace Setup
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">CRM ishga tushmoqda</h2>
          <p className="mt-2 text-sm text-slate-400">
            Loyiha avtomatik aniqlanmoqda. Iltimos kuting.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0a1d30] p-5 text-slate-300">
            <Loader2 size={18} className="animate-spin" />
            Loyihalar yuklanmoqda...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-4 text-sm text-red-300">
            {error}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0a1d30] p-5">
            <p className="text-sm text-slate-300">
              Sizga biriktirilgan loyiha topilmadi.
            </p>
            {canManageProjects ? (
              <Link
                to="/projects"
                className="mt-4 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                Loyiha yaratish
              </Link>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Direktor bilan bog‘lanib, loyihaga biriktirishni so‘rang.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
