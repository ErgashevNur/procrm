import { AlertCircle, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PipelineNoProject({ projects, loadProject }) {
  return (
    <div className="flex h-full flex-col bg-[#0d1e35]">
      <div className="flex shrink-0 items-center gap-4 border-b border-[#284860] bg-[#0f2231] p-6 text-white">
        <Select
          onValueChange={(name) => {
            const p = projects.find((x) => x.name === name);
            if (p) loadProject(p);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Loyihani tanlang" />
          </SelectTrigger>
          <SelectContent className="mt-10">
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.name}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        {projects.length === 0 ? (
          <>
            <AlertCircle className="h-12 w-12 text-yellow-400" />
            <p className="text-lg font-semibold text-white">Loyiha topilmadi</p>
            <p className="text-sm text-gray-400">
              Avval loyiha yarating yoki admin bilan bog\'laning.
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
            <FolderOpen className="h-14 w-14 text-blue-400" />
            <p className="text-xl font-semibold text-white">Loyihani tanlang</p>
            <div className="flex w-72 flex-col gap-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadProject(p)}
                  className="rounded-lg border border-[#2a4868] bg-[#11263a] px-4 py-3 text-left text-white transition-colors hover:bg-[#1a3552]"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
