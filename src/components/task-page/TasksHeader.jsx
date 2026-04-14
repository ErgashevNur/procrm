import { Columns3, Filter, LayoutList, Search } from "lucide-react";

export default function TasksHeader({
  stats,
  search,
  setSearch,
  activeTab,
  setActiveTab,
  filterStatus,
  setFilterStatus,
  API_STATUSES,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  hasFilters,
  viewMode,
  setViewMode,
  filtered,
}) {
  return (
    <div className="relative z-10 shrink-0 border-b border-white/5 bg-[#071828]/90 px-4 py-4 backdrop-blur-sm sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div>
          <h1 className="text-lg font-bold text-white">Vazifalar</h1>
          <p className="text-xs text-gray-600">{stats.all} ta vazifa</p>
        </div>
        <div className="flex w-full items-center gap-2 rounded-xl border border-white/5 bg-white/3 px-3 py-2 lg:max-w-sm lg:flex-1">
          <Search size={14} className="shrink-0 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Vazifa yoki mijoz ismi..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
          { key: "all", label: "Barchasi", count: stats.all, alert: false },
          {
            key: "today",
            label: "Bugun",
            count: stats.today,
            alert: stats.today > 0,
          },
          {
            key: "overdue",
            label: "Muddati o'tgan",
            count: stats.overdue,
            alert: stats.overdue > 0,
          },
          {
            key: "future",
            label: "Kelgusi tasklar",
            count: stats.future,
            alert: stats.future > 0,
          },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeTab === tab.key
                    ? "bg-white/12 text-white"
                    : "bg-white/5 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border border-white/5 bg-white/3 px-2 py-2 text-xs text-gray-400 outline-none sm:w-auto"
            >
              <option value="all">Barcha holat</option>
              {Object.entries(API_STATUSES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>

            <div className="flex flex-col gap-2 rounded-lg border border-white/5 bg-white/3 px-3 py-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Filter size={12} className="text-gray-600" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="min-w-0 bg-transparent text-xs text-gray-400 [color-scheme:dark] outline-none"
                />
              </div>
              <span className="hidden text-gray-600 sm:inline">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="min-w-0 bg-transparent text-xs text-gray-400 [color-scheme:dark] outline-none"
              />
            </div>

            {hasFilters && (
              <button
                onClick={() => {
                  setFilterStatus("all");
                  setDateFrom("");
                  setDateTo("");
                  setSearch("");
                  setActiveTab("all");
                }}
                className="self-start text-xs text-gray-600 transition-colors hover:text-red-400"
              >
                Tozalash ✕
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
            <div className="flex items-center rounded-lg border border-white/5 bg-white/3 p-0.5">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors ${
                  viewMode === "table"
                    ? "bg-white/10 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <LayoutList size={12} />
                Table
              </button>
              <button
                onClick={() => setViewMode("column")}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors ${
                  viewMode === "column"
                    ? "bg-white/10 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Columns3 size={12} />
                Column
              </button>
            </div>
            <span className="text-xs text-gray-600">{filtered.length} ta natija</span>
          </div>
        </div>
      </div>
    </div>
  );
}
