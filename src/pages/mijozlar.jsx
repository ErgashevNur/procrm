import { useState, useEffect, useRef } from "react";
import {
  Plus,
  FolderOpen,
  AlertCircle,
  Loader2,
  CalendarCheck2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "../components/ui/skeleton";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

const maxBirthDate = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
})();

// ─── API helper ───────────────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("user");
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 text-sm text-white shadow-xl ${
        type === "error" ? "bg-red-600" : "bg-green-600"
      }`}
    >
      {message}
      <button onClick={onClose} className="opacity-60 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}

// ─── applyDrag ────────────────────────────────────────────────────────────────
function applyDrag(statuses, source, destination, draggableId) {
  const srcId = Number(source.droppableId);
  const dstId = Number(destination.droppableId);

  return statuses.map((status) => {
    if (status.id === srcId) {
      // Manbadan leadni olib tashlaymiz
      const items = status.leads.filter((l) => String(l.id) !== draggableId);
      return { ...status, leads: items };
    }
    if (status.id === dstId) {
      // Maqsadga qo'shamiz
      const dragged = statuses
        .flatMap((s) => s.leads)
        .find((l) => String(l.id) === draggableId);
      if (!dragged) return status;
      const items = [...status.leads];
      items.splice(destination.index, 0, { ...dragged, statusId: dstId });
      return { ...status, leads: items };
    }
    return status;
  });
}

// ─── EMPTY FORM ───────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  leadSourceId: "",
  budjet: "",
  firstName: "",
  lastName: "",
  phone: "",
  extraPhone: "",
  adress: "",
  tag: "",
  birthDate: "",
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Pipeline() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const scrollInterval = useRef(null);

  const [appState, setAppState] = useState("loading");
  const [projects, setProjects] = useState([]);
  // statuses ichida har birida .leads array bor
  const [statuses, setStatuses] = useState([]);
  const [leadSource, setLeadSource] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const showToast = (message, type = "error") => setToast({ message, type });

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("user");
    if (!token) {
      navigate("/login");
      return;
    }

    const savedId = localStorage.getItem("projectId");
    const savedName = localStorage.getItem("projectName");

    const init = async () => {
      try {
        if (savedId) {
          const [projectsRes, statusesRes, sourcesRes] = await Promise.all([
            apiFetch(`${API}/projects`),
            apiFetch(`${API}/status/${savedId}`),
            apiFetch(`${API}/lead-source/${savedId}`),
          ]);
          if (!projectsRes || !statusesRes) return;

          const [projectsData, statusesData, sourcesData] = await Promise.all([
            projectsRes.json(),
            statusesRes.json(),
            sourcesRes?.json().catch(() => []),
          ]);

          setProjects(Array.isArray(projectsData) ? projectsData : []);
          // statusesData ichida har birida leads array bor
          setStatuses(
            statusesData.map((s) => ({
              ...s,
              id: Number(s.id),
              leads: Array.isArray(s.leads) ? s.leads : [],
            })),
          );
          setLeadSource(Array.isArray(sourcesData) ? sourcesData : []);
          setCurrentProject({ id: savedId, name: savedName });
          setAppState("ready");
        } else {
          const res = await apiFetch(`${API}/projects`);
          if (!res) return;
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          setProjects(list);
          if (list.length === 1) {
            await loadProject(list[0]);
          } else {
            setAppState("no-project");
          }
        }
      } catch (err) {
        console.error("Init xatosi:", err);
        showToast("Ma'lumotlar yuklanmadi", "error");
        setAppState("no-project");
      }
    };
    init();
  }, []);

  // ── Load project ──────────────────────────────────────────────────────────
  const loadProject = async (project) => {
    setAppState("loading");
    localStorage.setItem("projectId", project.id);
    localStorage.setItem("projectName", project.name);
    setCurrentProject({ id: project.id, name: project.name });
    try {
      const [statusesRes, sourcesRes] = await Promise.all([
        apiFetch(`${API}/status/${project.id}`),
        apiFetch(`${API}/lead-source/${project.id}`),
      ]);
      if (!statusesRes) return;

      const [statusesData, sourcesData] = await Promise.all([
        statusesRes.json(),
        sourcesRes?.json().catch(() => []),
      ]);

      setStatuses(
        statusesData.map((s) => ({
          ...s,
          id: Number(s.id),
          leads: Array.isArray(s.leads) ? s.leads : [],
        })),
      );
      setLeadSource(Array.isArray(sourcesData) ? sourcesData : []);
      setAppState("ready");
    } catch (err) {
      console.error("Loyiha yuklanmadi:", err);
      showToast("Loyiha ma'lumotlari yuklanmadi", "error");
      setAppState("no-project");
    }
  };

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  useEffect(() => {
    const track = (e) => {
      window.mouseX = e.clientX;
    };
    window.addEventListener("mousemove", track);
    return () => {
      window.removeEventListener("mousemove", track);
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    };
  }, []);

  const handleDragUpdate = () => {
    if (!scrollRef.current || scrollInterval.current) return;
    scrollInterval.current = setInterval(() => {
      const x = window.mouseX || 0;
      const rect = scrollRef.current.getBoundingClientRect();
      if (x > rect.right - 180) scrollRef.current.scrollLeft += 18;
      else if (x < rect.left + 180) scrollRef.current.scrollLeft -= 18;
    }, 40);
  };

  const stopScroll = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

  const onDragEnd = async (result) => {
    stopScroll();
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const prev = statuses;
    setStatuses((s) => applyDrag(s, source, destination, draggableId));

    const destId = Number(destination.droppableId);
    try {
      const res = await apiFetch(
        `${API}/leeds/status/${draggableId}?statusId=${destId}`,
        { method: "PATCH" },
      );
      if (res && !res.ok) throw new Error(`PATCH ${res.status}`);
    } catch (err) {
      console.error(err);
      setStatuses(prev);
      showToast("Xatolik: o'zgarish saqlanmadi", "error");
    }
  };

  // ── Form ──────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        projectId: Number(currentProject.id),
        ...(formData.extraPhone && { extraPhone: formData.extraPhone }),
        ...(formData.adress && { adress: formData.adress }),
        ...(formData.budjet && { budjet: Number(formData.budjet) }),
        ...(formData.leadSourceId && {
          leadSourceId: Number(formData.leadSourceId),
        }),
        ...(formData.tag && { tag: formData.tag }),
        ...(formData.birthDate && { birthDate: formData.birthDate }),
      };

      const res = await apiFetch(`${API}/leeds`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res || !res.ok) throw new Error();
      const newLead = await res.json();

      // Yangi leadni birinchi statusga qo'shamiz
      setStatuses((prev) =>
        prev.map((s, i) =>
          i === 0 ? { ...s, leads: [newLead, ...s.leads] } : s,
        ),
      );
      setSheetOpen(false);
      setFormData(EMPTY_FORM);
      showToast("Lead qo'shildi!", "success");
    } catch {
      showToast("Lead qo'shishda xatolik", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (appState === "loading") {
    return (
      <div className="flex flex-1 flex-col bg-[#0d1e35]">
        <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-[#284860] bg-[#0f2231] p-6">
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="flex gap-4 overflow-x-auto p-6">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="w-80 shrink-0">
                <Skeleton className="mb-3 h-10 rounded-lg" />
                <Skeleton className="h-64 rounded-lg" />
              </div>
            ))}
        </div>
      </div>
    );
  }

  // ── NO PROJECT ────────────────────────────────────────────────────────────
  if (appState === "no-project") {
    return (
      <>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-[#284860] bg-[#0f2231] p-6 text-white">
          <Select
            onValueChange={(name) => {
              const p = projects.find((x) => x.name === name);
              if (p) loadProject(p);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Loyihani tanlang" />
            </SelectTrigger>
            <SelectContent className="mt-10">
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-[#0d1e35]">
          {projects.length === 0 ? (
            <>
              <AlertCircle className="h-12 w-12 text-yellow-400" />
              <p className="text-lg font-semibold text-white">
                Loyiha topilmadi
              </p>
              <p className="text-sm text-gray-400">
                Administrator bilan bog'laning
              </p>
            </>
          ) : (
            <>
              <FolderOpen className="h-14 w-14 text-blue-400" />
              <p className="text-xl font-semibold text-white">
                Loyihani tanlang
              </p>
              <div className="flex w-72 flex-col gap-2">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => loadProject(p)}
                    className="rounded-lg border border-[#2a4868] bg-[#11263a] px-4 py-3 text-left text-white transition-colors hover:bg-[#1a3552]"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  // ── READY ─────────────────────────────────────────────────────────────────
  return (
    <>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#284860] bg-[#0f2231] p-6 text-white">
        <Select
          value={currentProject?.name}
          onValueChange={(name) => {
            const p = projects.find((x) => x.name === name);
            if (p) loadProject(p);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="mt-10">
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.name}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Add Lead Sheet */}
        <Sheet
          open={sheetOpen}
          onOpenChange={(o) => {
            setSheetOpen(o);
            if (!o) setFormData(EMPTY_FORM);
          }}
        >
          <SheetTrigger asChild>
            <button className="flex gap-2 rounded-md border px-3 py-1 hover:bg-[#1b3e57]">
              <Plus className="w-5" /> Add
            </button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto bg-[#07131d] px-5">
            <SheetHeader>
              <SheetTitle className="text-white">Lead qo'shish</SheetTitle>
            </SheetHeader>
            <form className="mt-4 w-full text-white" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Ism *</FieldLabel>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Ism"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Familiya</FieldLabel>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Familiya"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Telefon *</FieldLabel>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+998 __ ___ __ __"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Qo'shimcha</FieldLabel>
                    <Input
                      type="tel"
                      name="extraPhone"
                      value={formData.extraPhone}
                      onChange={handleChange}
                      placeholder="+998 __ ___ __ __"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Tug'ilgan sana</FieldLabel>
                  <Input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    max={maxBirthDate}
                  />
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    18 yoshdan katta bo'lishi shart (max:{" "}
                    {maxBirthDate.slice(0, 4)}-yil)
                  </p>
                </Field>
                <Field>
                  <FieldLabel>Manzil</FieldLabel>
                  <Input
                    name="adress"
                    value={formData.adress}
                    onChange={handleChange}
                    placeholder="Manzil"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Budjet</FieldLabel>
                    <Input
                      type="number"
                      name="budjet"
                      value={formData.budjet}
                      onChange={handleChange}
                      placeholder="so'm"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Manba</FieldLabel>
                    <Select
                      value={
                        formData.leadSourceId
                          ? String(formData.leadSourceId)
                          : ""
                      }
                      onValueChange={(v) =>
                        setFormData((p) => ({
                          ...p,
                          leadSourceId: parseInt(v),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tanlang..." />
                      </SelectTrigger>
                      <SelectContent className="mt-10">
                        {leadSource.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Teg</FieldLabel>
                  <Input
                    name="tag"
                    value={formData.tag}
                    onChange={handleChange}
                    placeholder="Masalan: VIP, comfort, business..."
                  />
                </Field>
                <Field orientation="horizontal" className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-[#07131d]"
                    onClick={() => setSheetOpen(false)}
                  >
                    Bekor
                  </Button>
                  <Button
                    type="submit"
                    className="border bg-[#07131d]"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Saqlash"
                    )}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Kanban board */}
      <DragDropContext onDragEnd={onDragEnd} onDragUpdate={handleDragUpdate}>
        <div
          ref={scrollRef}
          className="fixed top-37.5 right-0 bottom-0 left-64 overflow-x-auto overflow-y-hidden bg-[#0d1e35]"
          style={{ scrollBehavior: "auto" }}
        >
          <div
            className="flex h-full gap-4 p-6"
            style={{ minWidth: "max-content" }}
          >
            {statuses.map((col) => (
              <div key={col.id} className="flex h-full w-80 shrink-0 flex-col">
                <div
                  className="mb-3 overflow-hidden rounded-lg border-b-4 bg-[#11263a] shadow-sm"
                  style={{ borderBottomColor: col.color || "#6b7280" }}
                >
                  <div className="flex items-center justify-between bg-[#153043] px-4 py-3 font-semibold text-white">
                    <span className="truncate">{col.name}</span>
                    <span className="rounded-full bg-gray-700 px-2.5 py-1 text-xs">
                      {col.leads.length}
                    </span>
                  </div>
                </div>

                <Droppable droppableId={String(col.id)}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex flex-1 flex-col gap-2.5 overflow-y-auto rounded-lg p-2 transition-colors duration-150 ${
                        snapshot.isDraggingOver ? "bg-[#1a3552]/60" : ""
                      }`}
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#2a4868 transparent",
                      }}
                    >
                      {col.leads.length === 0 ? (
                        <div
                          className={`rounded-lg border-2 border-dashed p-6 text-center text-xs transition-colors duration-150 ${
                            snapshot.isDraggingOver
                              ? "border-blue-400/60 bg-blue-900/10 text-blue-400"
                              : "border-[#2a4868]/40 text-gray-500"
                          }`}
                        >
                          {snapshot.isDraggingOver
                            ? "Bu yerga tashlang"
                            : "Bo'sh"}
                        </div>
                      ) : (
                        col.leads.map((lead, index) => (
                          <Draggable
                            key={lead.id}
                            draggableId={String(lead.id)}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() =>
                                  !snapshot.isDragging &&
                                  navigate(`/leadDetails?leadId=${lead.id}`)
                                }
                                className={`cursor-pointer rounded-lg border border-[#2a4868]/30 bg-[#1a3552] p-3 text-sm text-white shadow-sm transition-all duration-150 hover:bg-[#21446a] ${
                                  snapshot.isDragging
                                    ? "scale-[1.03] rotate-1 border-blue-400/50 shadow-xl ring-2 shadow-black/40 ring-blue-500/30"
                                    : ""
                                }`}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: 1,
                                }}
                              >
                                <div className="font-medium">
                                  {lead.firstName} {lead.lastName}
                                </div>
                                <div className="mt-1 text-xs opacity-60">
                                  {lead.phone}
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                  {lead.budjet > 0 && (
                                    <div className="mt-1 text-xs text-green-400">
                                      {lead.budjet.toLocaleString()} so'm
                                    </div>
                                  )}
                                  {lead.taskRemainingDays != null && (
                                    <div className="mt-1 flex items-center gap-1 text-xs">
                                      <span
                                        className={
                                          String(
                                            lead.taskRemainingDays,
                                          ).startsWith("-")
                                            ? "text-red-400"
                                            : "text-green-400"
                                        }
                                      >
                                        {lead.taskRemainingDays}
                                      </span>
                                      <CalendarCheck2 className="h-3 w-3" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>
    </>
  );
}
