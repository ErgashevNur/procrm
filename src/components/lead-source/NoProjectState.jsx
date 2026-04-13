import { AlertCircle, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function NoProjectState({ projects, loadProject }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0f2231] text-gray-100">
      {projects.length === 0 ? (
        <>
          <AlertCircle className="h-12 w-12 text-yellow-400" />
          <p className="text-lg font-semibold text-white">Loyiha topilmadi</p>
          <p className="text-sm text-gray-400">
            Avval loyha (project) yarating yoki admin bilan bog'laning.
          </p>

          <Link
            to="/projects"
            className="rounded-xl border border-blue-400 px-4 py-2 text-blue-400 hover:bg-blue-400 hover:text-white"
          >
            Projects
          </Link>
        </>
      ) : (
        <>
          <FolderOpen className="h-14 w-14 text-indigo-400" />
          <p className="text-xl font-semibold">Loyihani tanlang</p>
          <p className="text-sm text-gray-400">
            Lead manbalarini ko'rish uchun loyiha tanlang
          </p>
          <div className="flex w-72 flex-col gap-2">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => loadProject(p)}
                className="rounded-xl border border-indigo-900/50 bg-indigo-950/50 px-4 py-3 text-left text-white transition-all hover:border-indigo-700/50 hover:bg-indigo-900/40"
              >
                <p className="font-medium">{p.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">ID: {p.id}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
