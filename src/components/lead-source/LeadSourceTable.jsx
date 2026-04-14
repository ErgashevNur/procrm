import { Loader2 } from "lucide-react";
import IconImage from "@/components/lead-source/IconImage";

export default function LeadSourceTable({
  leadSource,
  openEdit,
  canDeleteLeadSource,
  handleDelete,
  deletingId,
  getIconUrl,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-indigo-900/40 bg-gray-900/80 shadow-xl backdrop-blur-sm">
      <div className="grid grid-cols-12 gap-4 border-b border-indigo-900/50 bg-indigo-950/70 px-6 py-4 text-xs font-medium tracking-wider text-indigo-300/80 uppercase">
        <div className="col-span-4">Manba nomi</div>
        <div className="col-span-2">ID</div>
        <div className="col-span-2">Holat</div>
        <div className="col-span-2">Qo'shilgan</div>
        <div className="col-span-2 text-right">Amallar</div>
      </div>

      {leadSource.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-12 items-center gap-4 border-b border-indigo-900/30 px-6 py-5 transition-colors duration-150 last:border-b-0 hover:bg-indigo-950/40"
        >
          <div className="col-span-4 flex items-center gap-3">
            <IconImage
              icon={item.icon}
              name={item.name}
              getIconUrl={getIconUrl}
            />
            <span className="font-medium text-gray-100">{item.name || "—"}</span>
          </div>

          <div className="col-span-2 text-sm text-gray-400">#{item.id}</div>

          <div className="col-span-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                item.isActive
                  ? "border border-emerald-800/40 bg-emerald-900/50 text-emerald-300"
                  : "border border-rose-800/40 bg-rose-900/50 text-rose-300"
              }`}
            >
              {item.isActive ? "Faol" : "Faol emas"}
            </span>
          </div>

          <div className="col-span-2 text-sm text-gray-400">
            {new Date(item.createdAt).toLocaleDateString("uz-UZ", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>

          <div className="col-span-2 flex items-center justify-end gap-4">
            <button
              onClick={() => openEdit(item)}
              className="text-indigo-400 transition-colors hover:text-indigo-300"
              title="Tahrirlash"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>

            {canDeleteLeadSource ? (
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="text-rose-400 transition-colors hover:text-rose-300 disabled:opacity-40"
                title="O'chirish"
              >
                {deletingId === item.id ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            ) : null}
          </div>
        </div>
      ))}

      {leadSource.length === 0 && (
        <div className="py-16 text-center text-sm text-gray-500">
          Hozircha hech qanday lead manbasi mavjud emas
        </div>
      )}
    </div>
  );
}
