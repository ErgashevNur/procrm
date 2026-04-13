import { Copy, FileText, PenSquare, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TemplateCard({
  template,
  active,
  canManage,
  canDelete,
  onUse,
  onEdit,
  onDelete,
  onDuplicate,
  resolveTemplateContent,
}) {
  const content = resolveTemplateContent(template);
  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        active
          ? "border-white/20 bg-[#111827]"
          : "border-white/10 bg-[#0b1220] hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#111827]">
              <FileText size={16} className="text-white/70" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {template?.name || "Nomlanmagan template"}
              </p>
              <p className="text-[11px] text-white/40">{content.length} belgi</p>
            </div>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/65">{content}</p>
        </div>
        {active ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/70">
            Tanlangan
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="xs" onClick={() => onUse(template)}>
          <Zap />
          Qo'llash
        </Button>
        {canManage ? (
          <>
            <Button size="xs" variant="outline" onClick={() => onEdit(template)}>
              <PenSquare />
              Tahrirlash
            </Button>
            <Button size="xs" variant="ghost" onClick={() => onDuplicate(template)}>
              <Copy />
              Nusxa
            </Button>
            {canDelete ? (
              <Button size="xs" variant="ghost" onClick={() => onDelete(template)}>
                <Trash2 />
                O'chirish
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
