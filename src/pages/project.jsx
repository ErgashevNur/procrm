import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Loader2,
  FolderOpen,
  Building2,
  ImageIcon,
  Check,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { canDeleteData, getCurrentRole } from "@/lib/rbac";
import KotibamLoader from "@/components/KotibamLoader";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;
// const IMG_API = "https://back.prohome.uz/api/v1/image";

// "image/filename.jpg" → "https://back.prohome.uz/api/v1/image/filename.jpg"
const getImgUrl = (raw) => {
  if (!raw) return null;
  const clean = raw.replace(/^image\//, "");

  console.log(clean);

  return `${API}/image/${clean}`;
};

// ── API helper ────────────────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("user");
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }
  return res;
}

// ── Empty form ────────────────────────────────────────────────────────────────
const EMPTY = {
  name: "",
  address: "",
  companyId: "",
  image3d: null, // File object
};

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ project, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/[0.08] p-6"
        style={{ background: "#0f2030" }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Loyihani o'chirish
            </p>
            <p className="text-xs text-gray-500">
              Bu amalni qaytarib bo'lmaydi
            </p>
          </div>
        </div>
        <p className="mb-5 text-sm text-gray-400">
          <span className="font-semibold text-white">"{project.name}"</span>{" "}
          loyihasini o'chirmoqchimisiz?
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/[0.08] py-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
          >
            Bekor
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            O'chirish
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Image Drop Zone ───────────────────────────────────────────────────────────
function ImageDropZone({ file, preview, onChange }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    onChange(f);
  };

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium tracking-wider text-gray-500 uppercase">
        3D Rasm <span className="text-red-400">*</span>
      </p>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className="relative flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all"
        style={{
          borderColor: drag
            ? "#3b82f6"
            : preview
              ? "#3b82f640"
              : "rgba(255,255,255,0.08)",
          background: drag
            ? "rgba(59,130,246,0.06)"
            : preview
              ? "rgba(59,130,246,0.03)"
              : "rgba(255,255,255,0.02)",
        }}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              className="h-full w-full rounded-xl object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <p className="text-xs font-medium text-white">O'zgartirish</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
              <Upload size={16} className="text-gray-500" />
            </div>
            <p className="text-xs text-gray-600">
              Rasm yuklang yoki shu yerga tashlang
            </p>
            <p className="text-[10px] text-gray-700">PNG, JPG, WEBP</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {file && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-green-400">
          <Check size={11} /> {file.name}
        </p>
      )}
    </div>
  );
}

// ── Field component ───────────────────────────────────────────────────────────
function FormField({ label, required, icon: Icon, error, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium tracking-wider text-gray-500 uppercase">
        {Icon && <Icon size={11} className="text-gray-600" />}
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

function TInput({ value, onChange, placeholder, type = "text", ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      {...rest}
      className="w-full rounded-xl border px-3 py-2.5 text-sm text-white transition-all outline-none placeholder:text-gray-600"
      style={{ background: "#0a1929", borderColor: "rgba(255,255,255,0.07)" }}
      onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
    />
  );
}

// ── Drawer (add/edit) ─────────────────────────────────────────────────────────
function ProjectDrawer({ project, onClose, onSaved }) {
  const isEdit = !!project;

  // companyId — localStorage dan avtomatik
  const companyId = (() => {
    try {
      const raw = localStorage.getItem("userData");
      if (raw) return JSON.parse(raw)?.user?.companyId ?? "";
    } catch {}
    return localStorage.getItem("companyId") ?? "";
  })();

  const [form, setForm] = useState({
    name: project?.name ?? "",
    address: project?.address ?? "",
    companyId: project?.companyId ?? companyId,
    img: null,
  });
  const [preview, setPreview] = useState(
    project?.img ? getImgUrl(project.img) : null,
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImage = (file) => {
    setForm((f) => ({ ...f, image3d: file }));
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nom majburiy";
    if (!form.address.trim()) e.address = "Manzil majburiy";
    if (!isEdit && !form.image3d) e.image3d = "3D rasm majburiy";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("address", form.address.trim());
      fd.append("companyId", Number(form.companyId));
      if (form.image3d) fd.append("image3d", form.image3d);

      const url = isEdit ? `${API}/projects/${project.id}` : `${API}/projects`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await apiFetch(url, { method, body: fd });
      if (!res || !res.ok) throw new Error();

      toast.success(isEdit ? "Loyiha yangilandi ✅" : "Loyiha qo'shildi ✅");
      onSaved();
      onClose();
    } catch {
      toast.error("Xatolik yuz berdi ❌");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer */}
      <div
        className="relative flex h-full w-full max-w-md flex-col border-l border-white/6 shadow-2xl"
        style={{ background: "#071828", animation: "slideIn .25s ease" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              {isEdit ? "Loyihani tahrirlash" : "Yangi loyiha"}
            </h2>
            <p className="mt-0.5 text-xs text-gray-600">
              {isEdit ? `#${project.id}` : "Barcha maydonlarni to'ldiring"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] text-gray-500 transition-colors hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <FormField
              label="Nom"
              required
              icon={FolderOpen}
              error={errors.name}
            >
              <TInput
                value={form.name}
                onChange={set("name")}
                placeholder="Loyiha nomi"
              />
            </FormField>

            <FormField
              label="Manzil"
              required
              icon={Building2}
              error={errors.address}
            >
              <TInput
                value={form.address}
                onChange={set("address")}
                placeholder="To'liq manzil"
              />
            </FormField>

            <FormField
              label="3D Rasm"
              required={!isEdit}
              error={errors.image3d}
            >
              <ImageDropZone
                file={form.image3d}
                preview={preview}
                onChange={handleImage}
              />
            </FormField>
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-white/[0.06] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              Bekor
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <Check size={15} /> {isEdit ? "Saqlash" : "Qo'shish"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ project, onEdit, onDelete, index, canDelete = true }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/6 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/12"
      style={{
        background: "linear-gradient(145deg,#0f2438 0%,#0a1929 100%)",
        animation: `fadeUp .4s ease ${index * 0.05}s both`,
      }}
    >
      {/* 3D Image */}
      <div className="relative h-44 w-full overflow-hidden bg-[#0a1929]">
        {project.img ? (
          <img
            src={getImgUrl(project.img)}
            alt={project.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon size={32} className="text-gray-700" />
          </div>
        )}
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(7,24,40,0.9) 0%, transparent 60%)",
          }}
        />

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onEdit(project)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.12] bg-[#071828]/80 text-gray-400 backdrop-blur-sm transition-colors hover:text-blue-400"
          >
            <Pencil size={12} />
          </button>
          {canDelete ? (
            <button
              onClick={() => onDelete(project)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.12] bg-[#071828]/80 text-gray-400 backdrop-blur-sm transition-colors hover:text-red-400"
            >
              <Trash2 size={12} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="mb-1 truncate text-sm font-semibold text-white">
          {project.name}
        </h3>
        <p className="mb-3 truncate text-xs text-gray-600">{project.address}</p>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.04] bg-white/[0.02] px-2.5 py-1">
            <Building2 size={10} className="text-blue-400" />
            <span className="text-[10px] font-medium text-gray-500">
              Kompaniya
            </span>
            <span className="text-[10px] font-bold text-white">
              {project.companyId}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function Projects() {
  const role = getCurrentRole();
  const canDeleteProjects = canDeleteData(role);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(null); // null | "add" | project obj
  const [delTarget, setDelTarget] = useState(null); // project to delete
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await apiFetch(`${API}/projects`);
      if (!res) return;
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Loyihalar yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return <KotibamLoader fullScreen />;
  }

  const handleDelete = async () => {
    if (!delTarget || deleting) return;
    if (!canDeleteProjects) {
      toast.error("Sizda loyihani o'chirish uchun ruxsat yo'q");
      setDelTarget(null);
      return;
    }
    setDeleting(true);
    try {
      const res = await apiFetch(`${API}/projects/${delTarget.id}`, {
        method: "DELETE",
      });
      if (!res || !res.ok) throw new Error();
      toast.success("Loyiha o'chirildi");
      setProjects((p) => p.filter((x) => x.id !== delTarget.id));
    } catch {
      toast.error("O'chirishda xatolik ❌");
    } finally {
      setDeleting(false);
      setDelTarget(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#071828]"
      style={{ fontFamily: "'Segoe UI', sans-serif" }}
    >
      {/* Grid bg */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#071828]/90 px-6 py-4 backdrop-blur"
        style={{ animation: "fadeUp .3s ease both" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Loyihalar</h1>
            <p className="mt-0.5 text-xs text-gray-600">{projects.length} ta loyiha</p>
          </div>
          <button
            onClick={() => setDrawer("add")}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
              boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
            }}
          >
            <Plus size={16} />
            Yangi loyiha
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        {projects.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-4 py-24 text-center"
            style={{ animation: "fadeUp .4s ease both" }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <FolderOpen size={28} className="text-gray-700" />
            </div>
            <p className="text-base font-semibold text-white">
              Hech qanday loyiha yo'q
            </p>
            <p className="text-sm text-gray-600">
              Birinchi loyihangizni qo'shing
            </p>
            <button
              onClick={() => setDrawer("add")}
              className="mt-2 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
            >
              <Plus size={15} /> Loyiha qo'shish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                index={i}
                onEdit={(proj) => setDrawer(proj)}
                onDelete={(proj) => setDelTarget(proj)}
                canDelete={canDeleteProjects}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawer && (
        <ProjectDrawer
          project={drawer === "add" ? null : drawer}
          onClose={() => setDrawer(null)}
          onSaved={fetchProjects}
        />
      )}

      {/* Delete confirm */}
      {delTarget && (
        <ConfirmDialog
          project={delTarget}
          onConfirm={handleDelete}
          onCancel={() => setDelTarget(null)}
        />
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
