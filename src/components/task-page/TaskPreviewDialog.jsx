import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TaskPreviewDialog({
  previewTask,
  setPreviewTask,
  setPreviewDescription,
  previewLoading,
  previewDescription,
}) {
  return (
    <Dialog
      open={Boolean(previewTask)}
      onOpenChange={(open) => {
        if (!open) {
          setPreviewTask(null);
          setPreviewDescription("");
        }
      }}
    >
      <DialogContent className="border-white/10 bg-[#0b1b2a] text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base">Task tafsiloti</DialogTitle>
          <DialogDescription className="text-xs text-gray-400">
            To'liq task matni
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {previewTask?.leads && (
            <p className="text-xs text-gray-500">
              Mijoz:{" "}
              <span className="text-gray-300">
                {`${previewTask.leads.firstName || ""} ${previewTask.leads.lastName || ""}`.trim() ||
                  "—"}
              </span>
            </p>
          )}
          <div className="max-h-[55vh] overflow-auto rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm leading-6 whitespace-pre-wrap text-gray-200">
            {previewLoading ? "Yuklanmoqda..." : previewDescription || "—"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
