import { Loader2, MessageSquare, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SmsHeader({
  leads,
  canManageTemplates,
  openCreateTemplate,
  fetchAll,
  refreshing,
}) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/8 bg-[#0a1b2d] px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563eb] shadow-[0_8px_24px_rgba(37,99,235,0.35)]">
          <MessageSquare size={18} />
        </div>
        <div>
          <h1 className="text-lg font-bold">SMS Rassilka</h1>
          <p className="text-xs text-white/40">{leads.length} ta mijoz mavjud</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {canManageTemplates ? (
          <Button size="sm" variant="outline" onClick={openCreateTemplate}>
            <Plus />
            Template
          </Button>
        ) : null}
        <Button size="sm" variant="outline" onClick={() => fetchAll(true)} disabled={refreshing}>
          {refreshing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          Yangilash
        </Button>
      </div>
    </div>
  );
}
