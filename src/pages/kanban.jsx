import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/reui/kanban";
import { useEffect, useState } from "react";

const STATUS_COLORS = [
  {
    bg: "#1a1035",
    border: "#6d28d940",
    dot: "bg-violet-400",
    text: "text-violet-400",
    badge: "bg-violet-500/20 text-violet-300",
    borderSolid: "#6d28d9",
  },
  {
    bg: "#0c1a2e",
    border: "#0369a140",
    dot: "bg-sky-400",
    text: "text-sky-400",
    badge: "bg-sky-500/20 text-sky-300",
    borderSolid: "#0369a1",
  },
  {
    bg: "#0a1f17",
    border: "#05966940",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300",
    borderSolid: "#059669",
  },
  {
    bg: "#1f1607",
    border: "#d9770640",
    dot: "bg-amber-400",
    text: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300",
    borderSolid: "#d97706",
  },
  {
    bg: "#1f0a0e",
    border: "#e1183640",
    dot: "bg-rose-400",
    text: "text-rose-400",
    badge: "bg-rose-500/20 text-rose-300",
    borderSolid: "#e11836",
  },
  {
    bg: "#1a0a24",
    border: "#a21caf40",
    dot: "bg-fuchsia-400",
    text: "text-fuchsia-400",
    badge: "bg-fuchsia-500/20 text-fuchsia-300",
    borderSolid: "#a21caf",
  },
];

function LeadCard({ item, colorScheme }) {
  return (
    <div
      className={`group relative rounded-xl border ${colorScheme.border} cursor-grab bg-[#0f1117] p-4 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#13151e] hover:shadow-xl active:cursor-grabbing`}
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 right-4 left-4 h-[2px] rounded-full ${colorScheme.dot} opacity-60 transition-opacity group-hover:opacity-100`}
      />

      <div className="mt-1 flex items-start justify-between gap-2">
        <p className="flex-1 text-sm leading-snug font-medium text-white/90">
          {item.content}
        </p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${colorScheme.badge}`}
        >
          #{item.id}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center gap-2">
        <div className={`h-1.5 w-1.5 rounded-full ${colorScheme.dot}`} />
        <span className="text-xs text-white/30">Lead</span>
      </div>
    </div>
  );
}

function ColumnHeader({ title, count, colorScheme }) {
  return (
    <div className="mb-3 flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${colorScheme.dot}`} />
        <h3
          className={`text-sm font-semibold tracking-wide ${colorScheme.text}`}
        >
          {title}
        </h3>
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-bold ${colorScheme.badge}`}
      >
        {count}
      </span>
    </div>
  );
}

export default function KanbanPage() {
  const [rColumns, setRColumns] = useState([]);
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("user");
    const projectId = localStorage.getItem("projectId");
    fetch(`${import.meta.env.VITE_VITE_API_KEY_PROHOME}/status/${projectId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setRColumns(data))
      .catch((err) => console.error("Error fetching columns:", err));
  }, []);

  useEffect(() => {
    if (!rColumns || rColumns.length === 0) return;

    const token = localStorage.getItem("user");

    Promise.all(
      rColumns.map((column) =>
        fetch(
          `${import.meta.env.VITE_VITE_API_KEY_PROHOME}/leeds/by/${column?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        )
          .then((res) => res.json())
          .then((data) => ({ column, leads: data })),
      ),
    )
      .then((results) => {
        const newColumns = {};
        results.forEach(({ column, leads }) => {
          const leadsArray = Array.isArray(leads)
            ? leads
            : (leads?.data ?? leads?.items ?? []);

          newColumns[column.name] = leadsArray.map((lead) => ({
            id: String(lead.id),
            content:
              lead.firstName ?? lead.name ?? lead.description ?? "Untitled",
          }));
        });
        setColumns(newColumns);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching leads:", err));
  }, [rColumns]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-sm tracking-widest text-white/40 uppercase">
            Loading board
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-8 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs tracking-widest text-white/30 uppercase">
              Project Board
            </p>
            <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/30">
              {Object.values(columns).reduce(
                (acc, items) => acc + items.length,
                0,
              )}{" "}
              total leads
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/30">
              {Object.keys(columns).length} columns
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="overflow-x-auto p-6">
        <Kanban
          value={columns}
          onValueChange={setColumns}
          getItemValue={(item) => item.id}
        >
          <KanbanBoard className="flex min-w-max items-start gap-4 pb-6">
            {Object.entries(columns).map(([id, items], index) => {
              const colorScheme = STATUS_COLORS[index % STATUS_COLORS.length];
              return (
                <KanbanColumn
                  key={id}
                  value={id}
                  className="w-72 shrink-0 rounded-2xl p-4"
                  style={{
                    backgroundColor: colorScheme.bg,
                    border: `1px solid ${colorScheme.border}`,
                  }}
                >
                  <KanbanColumnHandle className="cursor-grab">
                    <ColumnHeader
                      title={id}
                      count={items.length}
                      colorScheme={colorScheme}
                    />
                  </KanbanColumnHandle>

                  <KanbanColumnContent
                    value={id}
                    className="flex min-h-[120px] flex-col gap-2.5"
                  >
                    {items.length === 0 ? (
                      <div
                        className={`flex flex-col items-center justify-center rounded-xl border border-dashed ${colorScheme.border} py-8 opacity-40`}
                      >
                        <p className="text-xs text-white/40">No leads</p>
                      </div>
                    ) : (
                      items.map((item) => (
                        <KanbanItem key={item.id} value={item.id}>
                          <KanbanItemHandle>
                            <LeadCard item={item} colorScheme={colorScheme} />
                          </KanbanItemHandle>
                        </KanbanItem>
                      ))
                    )}
                  </KanbanColumnContent>
                </KanbanColumn>
              );
            })}
          </KanbanBoard>

          <KanbanOverlay>
            <div className="size-full rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm" />
          </KanbanOverlay>
        </Kanban>
      </div>
    </div>
  );
}
