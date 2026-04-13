import { Plus, FolderOpen, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { canDeleteData, getCurrentRole } from "@/lib/rbac";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

// item.icon — rasm nomi yoki path
// GET /image/:imageUrl → rasmni qaytaradi
const getIconUrl = (icon) => {
  if (!icon) return null;
  if (icon.startsWith("http")) return icon;

  return `${API}/image/${icon.replace("image/", "")}`;
};

// ─── Icon component — rasm bor bo'lsa ko'rsat, yo'q bo'lsa harf ──────────────
function IconImage({ icon, name, size = "h-8 w-8" }) {
  const url = getIconUrl(icon);
  if (url) {
    return (
      <img
        src={url}
        alt={name || "icon"}
        className={`${size} rounded-md object-cover ring-1 ring-indigo-700/30`}
        onError={(e) => {
          // Rasm 404 yoki yuklanmasa — harf fallback ga o't
          const parent = e.target.parentNode;
          e.target.remove();
          const div = document.createElement("div");
          div.className = `flex ${size} items-center justify-center rounded-md bg-indigo-800/40 text-sm font-medium text-indigo-300 ring-1 ring-indigo-700/20`;
          div.textContent = (name || "?").charAt(0).toUpperCase();
          parent.prepend(div);
        }}
      />
    );
  }
  return (
    <div
      className={`flex ${size} items-center justify-center rounded-md bg-indigo-800/40 text-sm font-medium text-indigo-300 ring-1 ring-indigo-700/20`}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

// ─── API helper ───────────────────────────────────────────────────────────
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

export default function LeadSource() {
  const role = getCurrentRole();
  const canDeleteLeadSource = canDeleteData(role);
  const [appState, setAppState] = useState("loading"); // loading | no-project | ready
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null); // { id, name }
  const [leadSource, setLeadSource] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [newLeadSource, setNewLeadSource] = useState({
    name: "",
    isActive: false,
  });

  // ── Edit dialog ───────────────────────────────────────────────────────
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // ── Delete confirm ────────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState(null);

  // ─────────────────────────────────────────────────────────────────────
  // INIT — localStorage tekshir, project bor bo'lsa to'g'ri yukla
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const savedId = localStorage.getItem("projectId");
      const savedName = localStorage.getItem("projectName");

      try {
        // Har doim projects ni yukla (select uchun kerak)
        const projectsRes = await apiFetch(`${API}/projects`);
        if (!projectsRes) return;

        // JSON parse xatosidan himoya
        const projectsText = await projectsRes.text();
        let projectsList = [];
        try {
          const parsed = JSON.parse(projectsText);
          projectsList = Array.isArray(parsed) ? parsed : [];
        } catch {
          console.error(
            "Projects JSON parse xatosi:",
            projectsText.slice(0, 100),
          );
        }
        setProjects(projectsList);

        if (savedId) {
          // localStorage da project bor — lekin list da mavjudligini tekshir
          const exists = projectsList.find(
            (p) => String(p.id) === String(savedId),
          );
          const project =
            exists || (projectsList.length > 0 ? projectsList[0] : null);

          if (project) {
            await loadProject(project);
          } else {
            setAppState("no-project");
          }
        } else {
          // localStorage da project yo'q
          if (projectsList.length === 1) {
            // Bitta loyiha — avtomatik tanlash
            await loadProject(projectsList[0]);
          } else if (projectsList.length > 1) {
            setAppState("no-project");
          } else {
            // Umuman project yo'q
            setAppState("no-project");
          }
        }
      } catch (err) {
        console.error("Init xatosi:", err);
        setAppState("no-project");
      }
    };

    init();
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // Project tanlash — localStorage ga yoz, leadSource ni yukla
  // ─────────────────────────────────────────────────────────────────────
  const loadProject = async (project) => {
    setAppState("loading");
    localStorage.setItem("projectId", String(project.id));
    localStorage.setItem("projectName", project.name);
    setCurrentProject({ id: project.id, name: project.name });
    try {
      const res = await apiFetch(`${API}/lead-source/${project.id}`);
      if (!res) {
        setAppState("ready");
        setLeadSource([]);
        return;
      }
      const text = await res.text();
      let data = [];
      try {
        data = JSON.parse(text);
      } catch {
        console.error("LeadSource JSON xato");
      }
      setLeadSource(Array.isArray(data) ? data : []);
      setAppState("ready");
    } catch (err) {
      console.error("LeadSource yuklanmadi:", err);
      setLeadSource([]);
      setAppState("ready");
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // Rasmni tanlash helper
  // ─────────────────────────────────────────────────────────────────────
  const readImage = (file, setPreview) => {
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ─────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", newLeadSource.name);
      formData.append("projectId", currentProject.id);
      formData.append("isActive", newLeadSource.isActive);
      if (selectedImage) formData.append("icon", selectedImage);

      const res = await apiFetch(`${API}/lead-source`, {
        method: "POST",
        body: formData,
        // Content-Type o'rnatilmaydi — FormData o'zi to'g'ri boundary qo'yadi
      });

      if (!res || !res.ok) throw new Error();
      const data = await res.json();
      setLeadSource((prev) => [...prev, data]);
      setNewLeadSource({ name: "", isActive: false });
      setSelectedImage(null);
      setImagePreview(null);
      setDialogOpen(false);
    } catch (err) {
      console.error("Yaratishda xatolik:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // EDIT — dialog ochish
  // ─────────────────────────────────────────────────────────────────────
  const openEdit = (item) => {
    setEditItem({ ...item });
    setEditImage(null);
    setEditPreview(item.icon ? getIconUrl(item.icon) : null);
    setEditDialogOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────────
  // UPDATE (PATCH)
  // ─────────────────────────────────────────────────────────────────────
  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", editItem.name);
      formData.append("isActive", editItem.isActive);
      if (editImage) formData.append("icon", editImage);

      const res = await apiFetch(`${API}/lead-source/${editItem.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res || !res.ok) throw new Error();
      const updated = await res.json();
      setLeadSource((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s)),
      );
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Yangilashda xatolik:", err);
    } finally {
      setEditSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!canDeleteLeadSource) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await apiFetch(`${API}/lead-source/${id}`, {
        method: "DELETE",
      });
      if (!res || !res.ok) throw new Error();
      setLeadSource((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────────────
  if (appState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f2231]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-gray-500">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // NO PROJECT — project tanlash ekrani
  // ─────────────────────────────────────────────────────────────────────
  if (appState === "no-project") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0f2231] text-gray-100">
        {projects.length === 0 ? (
          <>
            <AlertCircle className="h-12 w-12 text-yellow-400" />
            <p className="text-lg font-semibold text-white">Loyiha topilmadi</p>
            <p className="text-sm text-gray-400">
              Avval loyha (project) yarating yoki admin bilan bog'laning.
            </p>

            <Link
              to="/projects"
              className="rounded-xl border border-blue-400 px-4 py-2 text-blue-400 hover:bg-blue-400 hover:text-white"
            >
              Projects
            </Link>
          </>
        ) : (
          <>
            <FolderOpen className="h-14 w-14 text-indigo-400" />
            <p className="text-xl font-semibold">Loyihani tanlang</p>
            <p className="text-sm text-gray-400">
              Lead manbalarini ko'rish uchun loyiha tanlang
            </p>
            <div className="flex w-72 flex-col gap-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadProject(p)}
                  className="rounded-xl border border-indigo-900/50 bg-indigo-950/50 px-4 py-3 text-left text-white transition-all hover:border-indigo-700/50 hover:bg-indigo-900/40"
                >
                  <p className="font-medium">{p.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">ID: {p.id}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // READY
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f2231] text-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <h1 className="text-2xl font-semibold tracking-tight text-indigo-300">
              Lead Manbalari
            </h1>

            {/* Project selector */}
            <Select
              value={currentProject?.name}
              onValueChange={(name) => {
                const p = projects.find((x) => x.name === name);
                if (p) loadProject(p);
              }}
            >
              <SelectTrigger className="w-full min-w-0 border-indigo-900/50 bg-indigo-950/50 text-sm text-gray-300 sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="mt-1">
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add button */}
          <Dialog
            open={dialogOpen}
            onOpenChange={(o) => {
              setDialogOpen(o);
              if (!o) {
                setImagePreview(null);
                setSelectedImage(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-indigo-700 sm:w-auto">
                <Plus size={16} /> Yangi manba
              </button>
            </DialogTrigger>

            <DialogContent className="bg-[#101a2a] text-white">
              <DialogHeader>
                <DialogTitle>Yangi lead manbasi qo'shish</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="name">Nom *</FieldLabel>
                  <Input
                    id="name"
                    value={newLeadSource.name}
                    onChange={(e) =>
                      setNewLeadSource((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Masalan: Instagram"
                    required
                  />
                  <FieldDescription>Manba nomini kiriting</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="icon">Icon rasmi</FieldLabel>
                  <Input
                    id="icon"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedImage(file);
                        readImage(file, setImagePreview);
                      }
                    }}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="mt-2 h-16 w-16 rounded-lg object-cover ring-2 ring-indigo-500"
                    />
                  )}
                </Field>

                <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-700 p-4">
                  <Label className="cursor-pointer">Aktiv holati</Label>
                  <Switch
                    checked={newLeadSource.isActive}
                    onCheckedChange={(v) =>
                      setNewLeadSource((p) => ({ ...p, isActive: v }))
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 text-black"
                    onClick={() => setDialogOpen(false)}
                  >
                    Bekor
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {submitting ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      "Yaratish"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Table ───────────────────────────────────────────────── */}
        <div className="hidden overflow-hidden rounded-xl border border-indigo-900/40 bg-gray-900/80 shadow-xl backdrop-blur-sm md:block">
          {/* Head */}
          <div className="grid grid-cols-12 gap-4 border-b border-indigo-900/50 bg-indigo-950/70 px-6 py-4 text-xs font-medium tracking-wider text-indigo-300/80 uppercase">
            <div className="col-span-4">Manba nomi</div>
            <div className="col-span-2">ID</div>
            <div className="col-span-2">Holat</div>
            <div className="col-span-2">Qo'shilgan</div>
            <div className="col-span-2 text-right">Amallar</div>
          </div>

          {/* Rows */}
          {leadSource.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 items-center gap-4 border-b border-indigo-900/30 px-6 py-5 transition-colors duration-150 last:border-b-0 hover:bg-indigo-950/40"
            >
              {/* Name + icon */}
              <div className="col-span-4 flex items-center gap-3">
                <IconImage icon={item.icon} name={item.name} />
                <span className="font-medium text-gray-100">
                  {item.name || "—"}
                </span>
              </div>

              {/* ID */}
              <div className="col-span-2 text-sm text-gray-400">#{item.id}</div>

              {/* Status */}
              <div className="col-span-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    item.isActive
                      ? "border border-emerald-800/40 bg-emerald-900/50 text-emerald-300"
                      : "border border-rose-800/40 bg-rose-900/50 text-rose-300"
                  }`}
                >
                  {item.isActive ? "Faol" : "Faol emas"}
                </span>
              </div>

              {/* Date */}
              <div className="col-span-2 text-sm text-gray-400">
                {new Date(item.createdAt).toLocaleDateString("uz-UZ", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-4">
                {/* Edit */}
                <button
                  onClick={() => openEdit(item)}
                  className="text-indigo-400 transition-colors hover:text-indigo-300"
                  title="Tahrirlash"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>

                {/* Delete */}
                {canDeleteLeadSource ? (
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="text-rose-400 transition-colors hover:text-rose-300 disabled:opacity-40"
                    title="O'chirish"
                  >
                    {deletingId === item.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          ))}

          {leadSource.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-500">
              Hozircha hech qanday lead manbasi mavjud emas
            </div>
          )}
        </div>

        <div className="space-y-3 md:hidden">
          {leadSource.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-indigo-900/40 bg-gray-900/80 p-4 shadow-xl backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <IconImage icon={item.icon} name={item.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-100">
                      {item.name || "—"}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">ID: #{item.id}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ${
                    item.isActive
                      ? "border border-emerald-800/40 bg-emerald-900/50 text-emerald-300"
                      : "border border-rose-800/40 bg-rose-900/50 text-rose-300"
                  }`}
                >
                  {item.isActive ? "Faol" : "Faol emas"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-gray-400">
                <span>
                  {new Date(item.createdAt).toLocaleDateString("uz-UZ", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => openEdit(item)}
                    className="text-indigo-400 transition-colors hover:text-indigo-300"
                    title="Tahrirlash"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>

                  {canDeleteLeadSource ? (
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="text-rose-400 transition-colors hover:text-rose-300 disabled:opacity-40"
                      title="O'chirish"
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}

          {leadSource.length === 0 && (
            <div className="rounded-2xl border border-indigo-900/40 bg-gray-900/80 py-16 text-center text-sm text-gray-500 shadow-xl backdrop-blur-sm">
              Hozircha hech qanday lead manbasi mavjud emas
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(o) => {
          setEditDialogOpen(o);
          if (!o) setEditPreview(null);
        }}
      >
        <DialogContent className="bg-[#101a2a] text-white">
          <DialogHeader>
            <DialogTitle>Manbani tahrirlash</DialogTitle>
          </DialogHeader>

          {editItem && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <Field>
                <FieldLabel>Nom *</FieldLabel>
                <Input
                  value={editItem.name}
                  onChange={(e) =>
                    setEditItem((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Manba nomi"
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Icon rasmi</FieldLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setEditImage(file);
                      readImage(file, setEditPreview);
                    }
                  }}
                />
                {editPreview && (
                  <img
                    src={editPreview}
                    alt="preview"
                    className="mt-2 h-16 w-16 rounded-lg object-cover ring-2 ring-indigo-500"
                  />
                )}
              </Field>

              <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-700 p-4">
                <Label className="cursor-pointer">Aktiv holati</Label>
                <Switch
                  checked={editItem.isActive}
                  onCheckedChange={(v) =>
                    setEditItem((p) => ({ ...p, isActive: v }))
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-black"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Bekor
                </Button>
                <Button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {editSubmitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    "Saqlash"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
