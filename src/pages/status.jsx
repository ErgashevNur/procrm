import { useState, useEffect } from "react";
import { Plus, FolderOpen, ChevronDown, Check, Layers } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "../components/ui/skeleton";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;
const IMG_API = "https://back.prohome.uz/api/v1/image";
const getImgUrl = (raw) =>
  raw ? `${IMG_API}/${raw.replace(/^image\//, "")}` : null;

async function apiFetch(url, token) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }
  return res;
}

// ── Project Dropdown ──────────────────────────────────────────────────────────
function ProjectSelect({ projects, selected, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          color: selected ? "#e2e8f0" : "#4b5563",
        }}
      >
        {selected?.image3dUrl && (
          <img
            src={getImgUrl(selected.image3dUrl)}
            alt=""
            className="h-4 w-4 shrink-0 rounded object-cover opacity-70"
          />
        )}
        <span className="max-w-[160px] truncate text-[13px] font-medium">
          {selected?.name ?? "Loyiha tanlang"}
        </span>
        <ChevronDown
          size={12}
          className={`shrink-0 text-gray-600 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full left-0 z-30 mt-1.5 w-56 overflow-hidden rounded-xl shadow-2xl"
            style={{
              background: "#0c1c2c",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onChange(p);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
              >
                {p.image3dUrl ? (
                  <img
                    src={getImgUrl(p.image3dUrl)}
                    alt=""
                    className="h-6 w-6 shrink-0 rounded-md object-cover opacity-70"
                  />
                ) : (
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <Layers size={11} className="text-gray-600" />
                  </div>
                )}
                <span className="flex-1 truncate text-[13px] text-gray-300">
                  {p.name}
                </span>
                {selected?.id === p.id && (
                  <Check size={11} className="shrink-0 text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Status Column ─────────────────────────────────────────────────────────────
function StatusCol({ col, index }) {
  const color = col.color || "#334155";
  const count = col.leads?.length ?? 0;

  return (
    <div
      className="flex w-[272px] shrink-0 flex-col overflow-hidden rounded-xl"
      style={{
        background: "#0b1c2c",
        border: "1px solid rgba(255,255,255,0.05)",
        animation: `fadeUp .28s ease ${index * 0.045}s both`,
        // stretch to column container height
        alignSelf: "stretch",
      }}
    >
      {/* Top accent */}
      <div
        className="h-px w-full shrink-0"
        style={{
          background: `linear-gradient(90deg,${color}70,transparent 70%)`,
        }}
      />

      {/* Header */}
      <div
        className="flex shrink-0 items-center gap-2.5 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: color }}
        />
        <span className="flex-1 truncate text-[13px] font-medium text-gray-200">
          {col.name}
        </span>
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ color: count > 0 ? color : "#1e3a4a" }}
        >
          {count}
        </span>
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto px-3 py-3"
        style={{ scrollbarWidth: "none" }}
      >
        {count === 0 && (
          <div className="flex h-20 items-center justify-center">
            <p className="text-[11px] text-gray-700">Bo'sh</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Skeleton col ──────────────────────────────────────────────────────────────
function ColSkeleton() {
  return (
    <div
      className="w-[272px] shrink-0 animate-pulse overflow-hidden rounded-xl"
      style={{
        background: "#0b1c2c",
        border: "1px solid rgba(255,255,255,0.04)",
        alignSelf: "stretch",
      }}
    >
      <div className="h-px bg-white/[0.04]" />
      <div className="flex items-center gap-2.5 border-b border-white/[0.04] px-4 py-3">
        <div className="h-1.5 w-1.5 rounded-full bg-white/[0.07]" />
        <div className="h-3 flex-1 rounded bg-white/[0.05]" />
        <div className="h-3 w-4 rounded bg-white/[0.04]" />
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function Status() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("user");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const savedId = localStorage.getItem("projectId");
    const savedName = localStorage.getItem("projectName");

    const init = async () => {
      try {
        if (savedId) {
          const [projRes, statRes] = await Promise.all([
            apiFetch(`${API}/projects`, token),
            apiFetch(`${API}/status/${savedId}`, token),
          ]);
          if (!projRes || !statRes) return;
          const [projData, statData] = await Promise.all([
            projRes.json(),
            statRes.json(),
          ]);
          const list = Array.isArray(projData) ? projData : [];
          setProjects(list);
          setStatus(Array.isArray(statData) ? statData : []);
          const found = list.find((p) => String(p.id) === String(savedId));
          setSelectedProject(found ?? { id: savedId, name: savedName });
        } else {
          const res = await apiFetch(`${API}/projects`, token);
          if (!res) return;
          const d = await res.json();
          setProjects(Array.isArray(d) ? d : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleProjectChange = async (p) => {
    localStorage.setItem("projectId", p.id);
    localStorage.setItem("projectName", p.name);
    setSelectedProject(p);
    setStatusLoading(true);
    try {
      const res = await apiFetch(`${API}/status/${p.id}`, token);
      if (!res) return;
      const d = await res.json();
      setStatus(Array.isArray(d) ? d : []);
    } catch (e) {
      console.error(e);
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Layout: section fills viewport, no page scroll ────────────────────────
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        background: "#071828",
      }}
    >
      {/* ── Topbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          flexShrink: 0,
          gap: 12,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "#071828",
          overflow: "visible",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
            flex: 1,
          }}
        >
          {loading ? (
            <Skeleton className="h-8 w-44 rounded-lg bg-white/[0.05]" />
          ) : (
            <ProjectSelect
              projects={projects}
              selected={selectedProject}
              onChange={handleProjectChange}
            />
          )}
          {/* Status color dots */}
          {!loading &&
            selectedProject &&
            !statusLoading &&
            status.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {status.map((s) => (
                  <span
                    key={s.id}
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: s.color || "#334155",
                    }}
                  />
                ))}
              </div>
            )}
        </div>

        <Link
          to="/addStatus"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            padding: "7px 14px",
            borderRadius: 8,
            background: "#1d4ed8",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          <Plus size={14} />
          Status qo'shish
        </Link>
      </div>

      {/* ── Body ── */}
      {loading ? (
        <div
          style={{
            display: "flex",
            flex: 1,
            gap: 12,
            padding: 20,
            overflow: "hidden",
            alignItems: "stretch",
          }}
        >
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <ColSkeleton key={i} />
            ))}
        </div>
      ) : !selectedProject ? (
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <FolderOpen size={28} color="#1e3a4a" />
          <p style={{ fontSize: 13, color: "#4b5563" }}>Loyiha tanlang</p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              width: 200,
            }}
          >
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProjectChange(p)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  textAlign: "left",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#cbd5e1",
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "background .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.02)")
                }
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      ) : statusLoading ? (
        <div
          style={{
            display: "flex",
            flex: 1,
            gap: 12,
            padding: 20,
            overflow: "hidden",
            alignItems: "stretch",
          }}
        >
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <ColSkeleton key={i} />
            ))}
        </div>
      ) : status.length === 0 ? (
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <p style={{ fontSize: 13, color: "#4b5563" }}>Hali status yo'q</p>
          <Link
            to="/addStatus"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              background: "#1d4ed8",
              color: "#fff",
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            <Plus size={13} /> Status qo'shish
          </Link>
        </div>
      ) : (
        /*
         * SCROLL FIX:
         * outer div: flex:1, overflow:hidden   → stops page scroll
         * inner div: overflowX:auto, overflowY:hidden, alignItems:stretch
         *            → horizontal scroll only, cols fill height
         */
        <div
          style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              padding: 20,
              overflowX: "auto",
              overflowY: "hidden",
              alignItems: "stretch", // ← cols stretch to row height
              width: "100%",
            }}
          >
            {status.map((col, i) => (
              <StatusCol key={col.id} col={col} index={i} />
            ))}

            {/* Add shortcut */}
            <Link
              to="/addStatus"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: 180,
                flexShrink: 0,
                borderRadius: 12,
                border: "1px dashed rgba(255,255,255,0.06)",
                textDecoration: "none",
                transition: "border-color .15s",
                alignSelf: "stretch",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")
              }
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <Plus size={13} color="#334155" />
              </div>
              <p style={{ fontSize: 11, color: "#334155" }}>Status qo'shish</p>
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { height: 3px; width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </section>
  );
}
