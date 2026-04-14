import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function TemplateDialog({
  open,
  mode,
  form,
  saving,
  onOpenChange,
  onChange,
  onSubmit,
  TEMPLATE_TOKENS,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-white/10 bg-[#08131e] text-white">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Template tahrirlash" : "Yangi template"}</DialogTitle>
          <DialogDescription className="text-white/55">
            SMS uchun qayta ishlatiladigan matnlarni shu yerda saqlaysiz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Template nomi</label>
            <Input
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Masalan, Welcome message"
              className="border-white/10 bg-white/[0.04] text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Xabar matni</label>
            <textarea
              value={form.content}
              onChange={(e) => onChange("content", e.target.value)}
              rows={8}
              placeholder="Hurmatli {{fullname}}, siz uchun yangi taklif tayyor."
              className="min-h-44 w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-cyan-400/50"
            />
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Qo'llab-quvvatlanadigan tokenlar
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TEMPLATE_TOKENS.map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => onChange("content", `${form.content}${form.content ? " " : ""}${token}`)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-cyan-300 transition-colors hover:border-cyan-400/40"
                >
                  {token}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {mode === "edit" ? "Saqlash" : "Template yaratish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
