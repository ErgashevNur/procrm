import { CalendarCheck2, Loader2 } from "lucide-react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import HorizontalScrollDock from "@/components/HorizontalScrollDock";

export default function PipelineBoard({
  onBeforeCapture,
  onDragStart,
  onDragEnd,
  boardRef,
  visibleStatuses,
  statusTotals,
  isFiltering,
  handleColumnScroll,
  handleLeadOpen,
  buildTaskBadgeMeta,
  hasActiveSearch,
  statusMeta,
  isBoardDragging,
}) {
  return (
    <>
      <DragDropContext
        onBeforeCapture={onBeforeCapture}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div
          ref={boardRef}
          className={`flex flex-1 gap-4 overflow-x-auto p-6 ${isBoardDragging ? "overflow-y-auto" : "overflow-y-hidden"}`}
          style={{ alignItems: "flex-start" }}
        >
          {visibleStatuses.map((col) => (
            <div key={col.id} className="flex shrink-0 flex-col" style={{ width: 300 }}>
              {(() => {
                const statusMetric = statusTotals.metrics?.[col.id] || {};
                const totalCount = Number(
                  statusMetric.leadCount ?? col.leads.length ?? 0,
                );
                const totalBudjet = Number(statusMetric.leadBudjet ?? 0);
                const filteredCount = col.leads.length;
                const filteredBudjet = (col.leads || []).reduce(
                  (sum, lead) => sum + Number(lead?.budjet || 0),
                  0,
                );

                return (
                  <div
                    className="mb-3 overflow-hidden rounded-lg border-b-4 bg-[#11263a]"
                    style={{ borderBottomColor: col.color || "#6b7280" }}
                  >
                    <div className="flex items-center justify-between bg-[#153043] px-4 py-3 font-semibold text-white">
                      <span className="truncate text-sm">{col.name}</span>
                      <span className="rounded-full bg-gray-700 px-2.5 py-0.5 text-xs">
                        {isFiltering ? `${filteredCount}/${totalCount}` : totalCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-[#11263a] px-4 py-2 text-[11px] text-gray-300">
                      <span>
                        Lead: {isFiltering ? `${filteredCount}/${totalCount}` : totalCount}
                      </span>
                      <span className="text-green-400">
                        {isFiltering
                          ? `${Number(filteredBudjet).toLocaleString()}/${Number(totalBudjet).toLocaleString()} so'm`
                          : `${Number(totalBudjet).toLocaleString()} so'm`}
                      </span>
                    </div>
                  </div>
                );
              })()}
              <Droppable
                droppableId={String(col.id)}
                mode="standard"
                renderClone={(provided, _snap, rubric) => {
                  const lead = col.leads[rubric.source.index];
                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="rounded-lg border border-blue-400/50 bg-[#1a3552] p-3 text-sm text-white shadow-2xl ring-2 ring-blue-500/30"
                      style={{
                        ...provided.draggableProps.style,
                        opacity: 1,
                        width: 300,
                      }}
                    >
                      <div className="font-medium">
                        {lead?.firstName} {lead?.lastName}
                      </div>
                      <div className="mt-1 text-xs opacity-60">{lead?.phone}</div>
                    </div>
                  );
                }}
              >
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`rounded-lg transition-colors duration-150 ${snapshot.isDraggingOver ? "bg-[#1a3552]/60" : ""}`}
                  >
                    <div
                      onScroll={
                        isBoardDragging
                          ? undefined
                          : (e) => handleColumnScroll(col.id, e)
                      }
                      className="flex flex-col gap-2.5 p-2"
                      style={{
                        minHeight: 80,
                        maxHeight: isBoardDragging
                          ? "none"
                          : "calc(100vh - 245px)",
                        overflowY: isBoardDragging ? "visible" : "auto",
                      }}
                    >
                      {col.leads.length === 0 ? (
                        <div
                          className={`rounded-lg border-2 border-dashed p-6 text-center text-xs transition-colors ${snapshot.isDraggingOver ? "border-blue-400/60 bg-blue-900/10 text-blue-400" : "border-[#2a4868]/40 text-gray-500"}`}
                        >
                          {snapshot.isDraggingOver ? "Bu yerga tashlang" : "Bo'sh"}
                        </div>
                      ) : (
                        col.leads.map((lead, index) => (
                          <Draggable
                            key={lead.id}
                            draggableId={String(lead.id)}
                            index={index}
                          >
                            {(provided, snapshot) => {
                              const taskBadge = buildTaskBadgeMeta(
                                lead.taskRemainingDays,
                              );
                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() =>
                                    handleLeadOpen(lead.id, snapshot.isDragging)
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
                                  <div className="mt-0.5 text-xs opacity-50">
                                    {lead.phone}
                                  </div>

                                  {lead.leadSource?.name && (
                                    <div className="mt-1.5 text-[11px] text-blue-400/80">
                                      {lead.leadSource.name}
                                    </div>
                                  )}

                                  {Array.isArray(lead.tag) && lead.tag.length > 0 && (
                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                      {lead.tag.map((t, i) => (
                                        <span
                                          key={i}
                                          className="rounded border border-[#2a4868]/50 bg-[#0d2a3e] px-1.5 py-0.5 text-[10px] text-gray-300"
                                        >
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-xs">
                                      {lead.budjet > 0 && (
                                        <div className="text-xs text-green-400">
                                          {Number(lead.budjet).toLocaleString()} so'm
                                        </div>
                                      )}
                                      {Array.isArray(lead.tasks) &&
                                        lead.tasks.length > 0 && (
                                          <div className="flex items-center gap-1 text-xs text-yellow-400/80">
                                            <CalendarCheck2 className="h-3 w-3" />
                                            <span>{lead.tasks.length} task</span>
                                          </div>
                                        )}
                                    </div>
                                    {taskBadge && (
                                      <div
                                        className={`inline-flex max-w-[180px] items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${taskBadge.text} ${taskBadge.border} ${taskBadge.bg}`}
                                      >
                                        <CalendarCheck2 className="h-3 w-3" />
                                        <span className="truncate">
                                          {taskBadge.label}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }}
                          </Draggable>
                        ))
                      )}
                      {!hasActiveSearch && statusMeta[col.id]?.loading && (
                        <div className="flex items-center justify-center py-2 text-xs text-blue-300">
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          Yuklanmoqda...
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      <HorizontalScrollDock targetRef={boardRef} />
    </>
  );
}
