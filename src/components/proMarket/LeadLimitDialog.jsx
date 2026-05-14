import { useEffect, useState } from "react";
import { Gauge, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("user");
  const headers = { Authorization: `Bearer ${token}`, ...options.headers };
  if (
    !(options.body instanceof FormData) &&
    !Object.keys(headers).some((k) => k.toLowerCase() === "content-type")
  ) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }
  return res;
}

export default function LeadLimitDialog({ open, onClose, onSaved }) {
  const [limit, setLimit] = useState("");
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const projectId = Number(localStorage.getItem("projectId")) || 0;

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiFetch(`${API}/lead-limit/daily`)
      .then((res) => res?.json())
      .then((json) => {
        if (json?.data) {
          setCurrentData(json.data);
          setLimit(String(json.data.limit ?? ""));
        }
      })
      .finally(() => setLoading(false));
  }, [open]);

  const handleSave = async () => {
    const n = Number(limit);
    if (!n || n < 1) {
      toast.error("Limit kamida 1 bo'lishi kerak");
      return;
    }
    setSaving(true);
    const res = await apiFetch(`${API}/lead-limit`, {
      method: "POST",
      body: JSON.stringify({ projectId, limit: n }),
    });
    setSaving(false);
    if (!res || !res.ok) {
      toast.error("Saqlashda xatolik yuz berdi");
      return;
    }
    toast.success("Kunlik limit saqlandi!");
    onSaved?.({ limit: n });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm border-[#1e3a52] bg-[#0b1b29] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Gauge size={18} className="text-blue-400" />
            Kunlik Lead Limiti
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Sales-managerlar kunlik gaplashishi kerak bo'lgan leadlar sonini
            belgilang.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-blue-400" size={24} />
          </div>
        ) : (
          <div className="flex flex-col gap-4 pt-2">
            {currentData && (
              <div className="flex items-center justify-between rounded-md border border-[#2a4868] bg-[#0a1929] px-4 py-3 text-sm">
                <span className="text-gray-400">Bugungi holat:</span>
                <span className="font-semibold">
                  <span
                    className={
                      currentData.count >= currentData.limit
                        ? "text-red-400"
                        : "text-green-400"
                    }
                  >
                    {currentData.count}
                  </span>
                  <span className="text-gray-500"> / </span>
                  <span className="text-white">{currentData.limit} lead</span>
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400">Yangi limit</label>
              <input
                type="number"
                min={1}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="Masalan: 80"
                className="h-10 w-full rounded-md border border-[#2a4868] bg-[#10263b] px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-[#2a4868] text-gray-300 hover:bg-[#1b3e57]"
              >
                Bekor qilish
              </Button>
              <Button
                size="sm"
                disabled={saving}
                onClick={handleSave}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Saqlash"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
