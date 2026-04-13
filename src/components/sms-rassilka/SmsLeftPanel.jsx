import { BarChart2, Clock, Loader2, Search, Send, Users, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import LeadRow from "./LeadRow";
import HistoryRow from "./HistoryRow";

export default function SmsLeftPanel({
  tab,
  setTab,
  charCount,
  smsCount,
  textRef,
  message,
  setMessage,
  templates,
  applyTemplate,
  selectAll,
  setSelectAll,
  selectionCount,
  filterStatus,
  setFilterStatus,
  uniqueStatuses,
  search,
  setSearch,
  filteredLeads,
  selected,
  toggleLead,
  handleSend,
  sending,
  history,
  imgUrl,
  getLeadName,
  formatDate,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0a1b2d]">
      <div className="flex border-b border-white/6">
        {[
          ["compose", "Yuborish", Send],
          ["history", "Tarix", BarChart2],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors"
            style={{
              borderBottomColor: tab === key ? "#2563eb" : "transparent",
              color: tab === key ? "#60a5fa" : "rgba(255,255,255,0.35)",
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === "compose" ? (
        <div className="flex h-[calc(100vh-180px)] flex-col">
          <div className="border-b border-white/6 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Xabar matni
              </p>
              <span className="text-[11px] text-white/35">
                {charCount} belgi · {smsCount} SMS
              </span>
            </div>
            <div className="rounded-2xl border border-[#1d4ed8]/40 bg-[#081726] p-3 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.08)]">
              <textarea
                ref={textRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="SMS xabar matnini kiriting..."
                rows={4}
                className="min-h-28 w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/22"
              />
              <div className="mt-3 h-[2px] overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((charCount / 160) * 100, 100)}%`,
                    background: charCount > 140 ? "#f59e0b" : "#2563eb",
                  }}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {templates.slice(0, 3).map((template) => (
                <button
                  key={template?.id || template?.name}
                  onClick={() => applyTemplate(template)}
                  className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[11px] text-white/50 transition-colors hover:text-white"
                >
                  <Zap size={10} className="mr-1 inline" />
                  {template?.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-white/6 px-4 py-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-xs text-white/55">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => setSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded accent-blue-500"
                />
                Barchasi
              </label>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-500/15 px-2 py-1 text-[10px] font-semibold text-blue-300">
                  {selectionCount} ta
                </span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/55 outline-none"
                >
                  <option value="all">Barcha status</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
              <Search size={14} className="text-white/25" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Mijoz ismi yoki telefon..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/22"
              />
              {search ? (
                <button onClick={() => setSearch("")} className="text-white/30 hover:text-white">
                  <X size={14} />
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {filteredLeads.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Users size={28} className="text-white/15" />
                <p className="mt-3 text-sm text-white/40">Mijozlar topilmadi</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLeads.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    checked={selected.has(lead.id)}
                    onToggle={toggleLead}
                    imgUrl={imgUrl}
                    getLeadName={getLeadName}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/6 p-4">
            <Button
              className="w-full"
              onClick={handleSend}
              disabled={sending || !message.trim() || selectionCount === 0}
            >
              {sending ? <Loader2 className="animate-spin" /> : <Send />}
              {sending ? "Yuborilmoqda..." : "Yuborish"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-180px)] overflow-y-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Yuborish tarixi</p>
              <p className="text-xs text-white/35">{history.length} ta yozuv</p>
            </div>
          </div>
          {history.length === 0 ? (
            <div className="flex h-[320px] flex-col items-center justify-center text-center">
              <Clock size={30} className="text-white/15" />
              <p className="mt-3 text-sm text-white/40">Tarix bo'sh</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, index) => (
                <HistoryRow key={item?.id || index} item={item} formatDate={formatDate} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
