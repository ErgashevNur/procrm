import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Smile } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { MANAGEMENT_ROLES, getCurrentRole } from "@/lib/rbac";
import KotibamLoader from "@/components/KotibamLoader";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#ec4899", "#f43f5e", "#64748b",
];

function apiFetch(url, options = {}) {
  const token = localStorage.getItem("user");
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

function ColorPicker({ value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-8 gap-1.5">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className="h-7 w-7 rounded-lg transition-all hover:scale-110"
            style={{
              background: c,
              outline: value === c ? `2px solid ${c}` : "2px solid transparent",
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Rang kodi:</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
          className="h-8 w-28 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs text-white outline-none focus:border-blue-500/50"
        />
        <span
          className="h-8 w-8 rounded-lg border border-white/10"
          style={{ background: value || "#6b7280" }}
        />
      </div>
    </div>
  );
}

export default function LeadMood() {
  const role = getCurrentRole();
  const canManage = MANAGEMENT_ROLES.includes(role);

  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createColor, setCreateColor] = useState("#3b82f6");
  const [creating, setCreating] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editing, setEditing] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/lead-mood`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMoods(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Kayfiyatlar yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreating(true);
    try {
      const res = await apiFetch(`${API}/lead-mood`, {
        method: "POST",
        body: JSON.stringify({ name: createName.trim(), color: createColor }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMoods((prev) => [...prev, data]);
      setCreateName("");
      setCreateColor("#3b82f6");
      setCreateOpen(false);
      toast.success("Kayfiyat qo'shildi ✅");
    } catch {
      toast.error("Xatolik ❌");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setEditName(item.name);
    setEditColor(item.color || "#3b82f6");
    setEditOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editItem) return;
    setEditing(true);
    try {
      const res = await apiFetch(`${API}/lead-mood/${editItem.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editName.trim(), color: editColor }),
      });
      if (!res.ok) throw new Error();
      setMoods((prev) =>
        prev.map((m) =>
          m.id === editItem.id ? { ...m, name: editName.trim(), color: editColor } : m,
        ),
      );
      setEditOpen(false);
      toast.success("Yangilandi ✅");
    } catch {
      toast.error("Xatolik ❌");
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("O'chirilsinmi?")) return;
    setDeletingId(id);
    try {
      const res = await apiFetch(`${API}/lead-mood/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMoods((prev) => prev.filter((m) => m.id !== id));
      toast.success("O'chirildi ✅");
    } catch {
      toast.error("O'chirishda xato ❌");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <KotibamLoader fullScreen />;

  return (
    <div className="min-h-screen bg-[#071828] px-6 py-8 text-gray-200">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}
            >
              <Smile size={20} style={{ color: "#a78bfa" }} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Mijoz kayfiyatlari</h1>
              <p className="text-xs text-gray-600">
                {moods.length} ta kayfiyat turi mavjud
              </p>
            </div>
          </div>

          {canManage && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2 text-sm"
                  style={{ background: "#7c3aed", border: "none" }}
                >
                  <Plus size={15} />
                  Qo'shish
                </Button>
              </DialogTrigger>
              <DialogContent
                className="border-white/10 text-white"
                style={{ background: "#0a1929" }}
              >
                <DialogHeader>
                  <DialogTitle className="text-white">Yangi kayfiyat</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-2">
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-500">Nom</label>
                    <Input
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="Masalan: Jahldor, Qiziquvchan..."
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-500">Rang</label>
                    <ColorPicker value={createColor} onChange={setCreateColor} />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateOpen(false)}
                      className="text-gray-400"
                    >
                      Bekor
                    </Button>
                    <Button
                      type="submit"
                      disabled={creating || !createName.trim()}
                      style={{ background: "#7c3aed", border: "none" }}
                    >
                      {creating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Saqlash"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* List */}
        {moods.length === 0 ? (
          <div
            className="flex flex-col items-center gap-3 rounded-2xl py-16 text-center"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
          >
            <Smile size={40} className="text-gray-700" />
            <p className="text-sm text-gray-500">Hali kayfiyat qo'shilmagan</p>
            {canManage && (
              <p className="text-xs text-gray-700">
                Yuqoridagi "Qo'shish" tugmasini bosing
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {moods.map((mood) => (
              <div
                key={mood.id}
                className="flex items-center gap-4 rounded-xl px-4 py-3.5"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: mood.color || "#6b7280" }}
                />
                <span
                  className="rounded-lg px-3 py-1 text-sm font-semibold"
                  style={{
                    background: `${mood.color || "#6b7280"}18`,
                    color: mood.color || "#9ca3af",
                    border: `1px solid ${mood.color || "#6b7280"}35`,
                  }}
                >
                  {mood.name}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  {canManage && (
                    <>
                      <button
                        onClick={() => openEdit(mood)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-white/10 hover:text-blue-400"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(mood.id)}
                        disabled={deletingId === mood.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-white/10 hover:text-red-400 disabled:opacity-40"
                      >
                        {deletingId === mood.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="border-white/10 text-white"
          style={{ background: "#0a1929" }}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Kayfiyatni tahrirlash</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div>
              <label className="mb-1.5 block text-xs text-gray-500">Nom</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-gray-500">Rang</label>
              <ColorPicker value={editColor} onChange={setEditColor} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="text-gray-400"
              >
                Bekor
              </Button>
              <Button
                type="submit"
                disabled={editing || !editName.trim()}
                style={{ background: "#7c3aed", border: "none" }}
              >
                {editing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Saqlash"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
