import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export default function InsertModal({
  anchorRef,
  afterId,
  projectId,
  onClose,
  onSubmit,
  template,
  colors,
}) {
  const modalRef = useRef();
  const [name, setName] = useState(template?.name || "");
  const [color, setColor] = useState(template?.color || "#3b82f6");
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
  }, [anchorRef, onClose]);

  useEffect(() => {
    if (template) {
      setName(template.name || "");
      setColor(template.color || "#3b82f6");
    } else {
      setName("");
      setColor("#3b82f6");
    }
  }, [template]);

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

  const floating = !anchorRef?.current;
  const style = floating
    ? undefined
    : { top: pos.top, left: Math.max(8, pos.left) };

  return (
    <div
      ref={modalRef}
      className={`fixed z-50 w-64 rounded-xl border border-[#1a3a52] bg-[#0f2942] p-4 shadow-2xl ${
        floating ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : ""
      }`}
      style={style}
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
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`h-6 w-6 rounded-full transition-all ${
              color === c
                ? "ring-2 ring-white ring-offset-1 ring-offset-[#0f2942]"
                : "hover:scale-110"
            }`}
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
