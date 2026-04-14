import { AlertTriangle, Loader2 } from "lucide-react";

export default function ConfirmDialog({
  company,
  onConfirm,
  onCancel,
  deleting = false,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[4px]">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0f2030] p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Kompaniyani o'chirish
            </p>
            <p className="text-xs text-gray-500">Bu amalni qaytarib bo'lmaydi</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-gray-400">
          <span className="font-semibold text-white">
            &quot;{company?.name || "Noma'lum"}&quot;
          </span>{" "}
          kompaniyasini o'chirmoqchimisiz?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-xl border border-white/[0.08] py-2 text-sm font-medium text-gray-400 transition-colors hover:text-white disabled:opacity-50"
          >
            Bekor
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "O'chirish"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
