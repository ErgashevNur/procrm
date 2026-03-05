import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, Pen, RefreshCcw, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../components/ui/button";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

const COLORS = [
  "#4B0082",
  "#CC7722",
  "#006400",
  "#0D1B2A",
  "#8b5cf6",
  "#800000",
  "#2F4F4F",
  "#5C4033",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

const PROTECTED_TYPES = ["NEW", "SUCCESS", "CANCELED"];

// ── Helpers ──────────────────────────────────────────────────────────────────
const isProtected = (col) =>
  col && PROTECTED_TYPES.includes(col.type?.toUpperCase());

/**
 * Columns massivini to'g'ri tartibga keltiradi:
 * NEW → [oddiylar] → SUCCESS → CANCELED
 */
function sortColumns(cols) {
  const newCol = cols.find((c) => c.type?.toUpperCase() === "NEW");
  const successCol = cols.find((c) => c.type?.toUpperCase() === "SUCCESS");
  const canceledCol = cols.find((c) => c.type?.toUpperCase() === "CANCELED");
  const rest = cols.filter((c) => !isProtected(c));
  return [
    ...(newCol ? [newCol] : []),
    ...rest,
    ...(successCol ? [successCol] : []),
    ...(canceledCol ? [canceledCol] : []),
  ];
}

/**
 * Drag ruxsatini tekshiradi — faqat type asosida:
 * - active column protected bo'lsa — drag yo'q
 * - over column protected bo'lsa — drop yo'q
 */
function isDragAllowed(columns, activeId, overId) {
  const activeCol = columns.find((c) => c.id === activeId);
  const overCol = columns.find((c) => c.id === overId);

  if (isProtected(activeCol)) return false;
  if (isProtected(overCol)) return false;

  return true;
}

// ── Sortable column wrapper ──────────────────────────────────────────────────
function SortableColumn({ id, children, disabled }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({
        listeners: disabled ? undefined : listeners,
        attributes: disabled ? undefined : attributes,
      })}
    </div>
  );
}

// ── Insert modal ─────────────────────────────────────────────────────────────
function InsertModal({ anchorRef, afterId, projectId, onClose, onSubmit }) {
  const modalRef = useRef();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX - 180,
      });
    }
  }, [anchorRef]);

  useEffect(() => {
    const h = (e) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target)
      )
        onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim().toUpperCase(),
      projectId: Number(projectId),
      color,
      after: afterId ?? 0,
    });
    onClose();
  };

  return (
    <div
      ref={modalRef}
      className="fixed z-50 w-64 rounded-xl border border-[#1a3a52] bg-[#0f2942] p-4 shadow-2xl"
      style={{ top: pos.top, left: Math.max(8, pos.left) }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Yangi status</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={15} />
        </button>
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Nom kiriting..."
        autoFocus
        className="mb-3 w-full rounded-lg border border-[#2a4a62] bg-[#1a3a52] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
      />
      <p className="mb-2 text-xs text-gray-400">Rang</p>
      <div className="mb-3 grid grid-cols-6 gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`h-6 w-6 rounded-full transition-all ${color === c ? "ring-2 ring-white ring-offset-1 ring-offset-[#0f2942]" : "hover:scale-110"}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div
        className="mb-3 h-1 w-full rounded-full"
        style={{ background: color }}
      />
      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Qo'shish
      </button>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AddStatus() {
  const token = localStorage.getItem("user");
  const projectId = localStorage.getItem("projectId");

  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insertAfterId, setInsertAfterId] = useState(null);
  const insertBtnRefs = useRef({});
  const [editId, setEditId] = useState(null);
  const [updateName, setUpdateName] = useState("");
  const [updateColor, setUpdateColor] = useState("#3b82f6");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    if (!projectId) {
      setLoading(false);
      return;
    }
    fetchColumns();
  }, []);

  const fetchColumns = async () => {
    try {
      const res = await fetch(`${API}/status/${projectId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      // Sahifa ochilganda ham to'g'ri tartibga solib qo'yamiz
      setColumns(sortColumns(Array.isArray(data) ? data : []));
    } catch {
      toast.error("Ustunlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    // Drag ruxsat tekshiruvi
    if (!isDragAllowed(columns, active.id, over.id)) {
      const activeCol = columns.find((c) => c.id === active.id);
      if (isProtected(activeCol)) {
        toast.error(`"${activeCol.name}" statusini ko'chirish mumkin emas ❌`);
      } else {
        toast.error("Bu pozitsiyaga ko'chirish mumkin emas ❌");
      }
      return;
    }

    const oldIndex = columns.findIndex((c) => c.id === active.id);
    const newIndex = columns.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(columns, oldIndex, newIndex);
    setColumns(reordered);

    const afterId = newIndex === 0 ? 0 : reordered[newIndex - 1].id;

    console.log(
      `[Drag] "${columns.find((c) => c.id === active.id)?.name}" (id: ${active.id}) → after id: ${afterId}`,
      afterId === 0 ? "(birinchi o'ringa)" : `(id ${afterId} dan keyin)`,
    );

    try {
      const res = await fetch(`${API}/status/${active.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ after: afterId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Tartib saqlandi ✅");
    } catch (err) {
      setColumns(columns);
      toast.error("Saqlashda xato: " + err.message);
    }
  };

  const handleInsertSubmit = async (payload) => {
    const tempId = Date.now();
    const tempCol = {
      id: tempId,
      name: payload.name,
      color: payload.color,
      _temp: true,
    };

    setColumns((prev) => {
      let next;
      if (!payload.after) next = [tempCol, ...prev];
      else {
        const idx = prev.findIndex((c) => c.id === payload.after);
        next =
          idx === -1
            ? [...prev, tempCol]
            : [...prev.slice(0, idx + 1), tempCol, ...prev.slice(idx + 1)];
      }
      return sortColumns(next); // yangi column qo'shilganda ham tartib saqlansin
    });

    try {
      const res = await fetch(`${API}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setColumns((prev) =>
        sortColumns(prev.map((c) => (c.id === tempId ? { ...data } : c))),
      );
      toast.success("Status qo'shildi ✅");
    } catch (err) {
      setColumns((prev) => prev.filter((c) => c.id !== tempId));
      toast.error("Qo'shishda xato: " + err.message);
    }
  };

  const deleteColumn = async (columnId) => {
    const prev = columns;
    setColumns((c) => c.filter((col) => col.id !== columnId));
    try {
      const res = await fetch(`${API}/status/${columnId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Xato");
      }
      toast.success("Status o'chirildi ✅");
    } catch (err) {
      setColumns(prev);
      toast.error(err.message || "O'chirishda xato ❌");
    }
  };

  const updateColumn = async (columnId) => {
    if (!updateName.trim()) return;
    setUpdateLoading(true);
    const body = { name: updateName.trim(), color: updateColor };
    const prev = columns;
    setColumns((c) =>
      c.map((col) => (col.id === columnId ? { ...col, ...body } : col)),
    );
    setEditId(null);
    try {
      const res = await fetch(`${API}/status/${columnId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success("Status yangilandi ✅");
    } catch {
      setColumns(prev);
      toast.error("Yangilashda xato ❌");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-0 overflow-x-auto bg-[#0a1929] p-6">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="w-72 shrink-0">
              <Skeleton className="mb-3 h-12 w-full rounded-lg bg-[#1c2b3a]" />
              <Skeleton className="h-48 w-full rounded-lg bg-[#1c2b3a]" />
            </div>
          ))}
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#0a1929] text-gray-400">
        Pipeline sahifasidan loyihani tanlang
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a1929]">
      <div className="scrollbar-hide flex flex-1 gap-0 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={({ active }) => setActiveId(active.id)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext
            items={columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column, index) => {
              const locked = isProtected(column);
              return (
                <SortableColumn
                  key={column.id}
                  id={column.id}
                  disabled={locked}
                >
                  {({ listeners, attributes }) => (
                    <div
                      className="relative flex h-full shrink-0 flex-col border-r border-[#1a3a52]"
                      style={{ width: "280px" }}
                    >
                      <div
                        className="relative shrink-0 bg-[#0f2942]"
                        style={{
                          borderBottom: `3px solid ${column.color || "#6b7280"}`,
                        }}
                      >
                        <div className="flex items-center justify-between px-4 py-3">
                          <h2 className="text-xs font-semibold tracking-widest text-white uppercase">
                            {column.name}
                            {column._temp && (
                              <span className="ml-2 text-[10px] font-normal text-gray-500 normal-case">
                                saqlanmoqda...
                              </span>
                            )}
                            {/* Lock belgisi protected columnlar uchun */}
                            {locked && (
                              <span className="ml-2 text-[10px] font-normal text-gray-500 normal-case">
                                🔒
                              </span>
                            )}
                          </h2>

                          <div className="flex items-center gap-2">
                            {locked ? (
                              <span
                                className="cursor-not-allowed text-[#3a5570]/30 select-none"
                                title="Ko'chirish mumkin emas"
                              >
                                ⠿
                              </span>
                            ) : (
                              <span
                                {...listeners}
                                {...attributes}
                                className="cursor-grab text-[#3a5570] select-none active:cursor-grabbing"
                              >
                                ⠿
                              </span>
                            )}

                            <button
                              onClick={() => deleteColumn(column.id)}
                              disabled={!!column._temp}
                              className="text-gray-500 transition-colors hover:text-red-500 disabled:opacity-30"
                            >
                              <Trash2 size={14} />
                            </button>

                            <Dialog
                              open={editId === column.id}
                              onOpenChange={(open) => {
                                if (open) {
                                  setEditId(column.id);
                                  setUpdateName(column.name);
                                  setUpdateColor(column.color || "#3b82f6");
                                } else setEditId(null);
                              }}
                            >
                              <DialogTrigger asChild>
                                <button
                                  disabled={!!column._temp}
                                  className="text-gray-500 transition-colors hover:text-blue-400 disabled:opacity-30"
                                >
                                  <Pen size={14} />
                                </button>
                              </DialogTrigger>
                              <DialogContent className="bg-[#0f2231] text-white">
                                <DialogHeader>
                                  <DialogTitle>Statusni tahrirlash</DialogTitle>
                                </DialogHeader>
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    updateColumn(column.id);
                                  }}
                                  className="space-y-4 pt-2"
                                >
                                  <input
                                    type="text"
                                    value={updateName}
                                    onChange={(e) =>
                                      setUpdateName(e.target.value)
                                    }
                                    placeholder="Nom kiriting..."
                                    className="w-full rounded-lg border border-[#2a4a62] bg-[#1a3a52] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                    autoFocus
                                  />
                                  <div>
                                    <p className="mb-2 text-xs text-gray-400">
                                      Rang
                                    </p>
                                    <div className="grid grid-cols-8 gap-2">
                                      {COLORS.map((c) => (
                                        <button
                                          type="button"
                                          key={c}
                                          onClick={() => setUpdateColor(c)}
                                          className={`h-7 w-7 rounded-full transition-all ${updateColor === c ? "ring-2 ring-white ring-offset-1 ring-offset-[#0f2231]" : "hover:scale-110"}`}
                                          style={{ backgroundColor: c }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={
                                      updateLoading || !updateName.trim()
                                    }
                                  >
                                    <RefreshCcw
                                      size={14}
                                      className={
                                        updateLoading ? "animate-spin" : ""
                                      }
                                    />
                                    {updateLoading
                                      ? "Yangilanmoqda..."
                                      : "Yangilash"}
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>

                        {/* + insert button — faqat drag qilsa bo'ladigan zone ichida */}
                        {index < columns.length - 1 &&
                          !isProtected(columns[index + 1]) && (
                            <button
                              ref={(el) =>
                                (insertBtnRefs.current[column.id] = el)
                              }
                              onClick={() =>
                                setInsertAfterId((prev) =>
                                  prev === column.id ? null : column.id,
                                )
                              }
                              className={`absolute -right-3 -bottom-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                                insertAfterId === column.id
                                  ? "border-blue-500 bg-blue-600 text-white"
                                  : "border-[#2a4a62] bg-[#0a1929] text-gray-400 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                              }`}
                            >
                              <Plus size={12} />
                            </button>
                          )}
                      </div>

                      <div className="scrollbar-hide flex-1 overflow-y-auto bg-[#0f2942]" />
                    </div>
                  )}
                </SortableColumn>
              );
            })}
          </SortableContext>

          <DragOverlay>
            {activeId
              ? (() => {
                  const col = columns.find((c) => c.id === activeId);
                  return col ? (
                    <div
                      className="flex h-20 shrink-0 flex-col rounded-lg border border-blue-500/50 bg-[#0f2942] shadow-2xl shadow-blue-500/20"
                      style={{
                        width: "280px",
                        borderBottom: `3px solid ${col.color || "#6b7280"}`,
                      }}
                    >
                      <div className="flex items-center px-4 py-3">
                        <span className="text-xs font-semibold tracking-widest text-white uppercase">
                          {col.name}
                        </span>
                      </div>
                    </div>
                  ) : null;
                })()
              : null}
          </DragOverlay>
        </DndContext>

        <div className="flex h-full w-64 shrink-0 flex-col border-r border-[#1a3a52] bg-[#0a1929] p-4">
          <button
            ref={(el) => (insertBtnRefs.current["end"] = el)}
            onClick={() =>
              setInsertAfterId((prev) => (prev === "end" ? null : "end"))
            }
            className={`flex items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm transition-colors ${
              insertAfterId === "end"
                ? "border-blue-500 bg-[#0f2942] text-white"
                : "border-[#2a4a62] text-gray-400 hover:border-blue-500/50 hover:bg-[#0f2942] hover:text-white"
            }`}
          >
            <Plus size={16} />
            Yangi status qo'shish
          </button>
        </div>
      </div>

      {insertAfterId !== null && (
        <InsertModal
          anchorRef={{ current: insertBtnRefs.current[insertAfterId] }}
          afterId={
            insertAfterId === "end"
              ? (columns[columns.length - 1]?.id ?? 0)
              : insertAfterId
          }
          projectId={projectId}
          onClose={() => setInsertAfterId(null)}
          onSubmit={handleInsertSubmit}
        />
      )}
    </div>
  );
}
