import { useEffect, useMemo, useState } from "react";
import {
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { Activity, Target, Wallet, Layers3, Users } from "lucide-react";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

const TABS = [
  { key: "day", label: "Kunlik" },
  { key: "week", label: "Haftalik" },
  { key: "month", label: "Oylik" },
];

const PALETTE = [
  "#38bdf8",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f97316",
  "#f87171",
  "#c084fc",
  "#22d3ee",
];

const FALLBACK = {
  trend: [],
  stages: [],
  managers: [],
  totalDeals: 0,
  totalAmount: 0,
  donut: [],
};

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

function parseDate(input) {
  if (!input) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d) {
  const date = startOfDay(d);
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  return date;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addDays(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function addMonths(d, months) {
  return new Date(d.getFullYear(), d.getMonth() + months, 1);
}

function dateKey(d, mode) {
  if (mode === "day") return startOfDay(d).toISOString().slice(0, 10);
  if (mode === "week") return startOfWeek(d).toISOString().slice(0, 10);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function bucketLabel(d, mode) {
  if (mode === "day") {
    return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" });
  }
  if (mode === "week") {
    const end = addDays(d, 6);
    const s = d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" });
    const e = end.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" });
    return `${s} - ${e}`;
  }
  return d.toLocaleDateString("uz-UZ", { month: "short", year: "2-digit" });
}

function normalizeLeadsPayload(json) {
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.leads)) return json.leads;
  return [];
}

function normalizeStatusesPayload(json) {
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.statuses)) return json.statuses;
  if (Array.isArray(json)) return json;
  return [];
}

function pickStatusName(lead, statusMap) {
  return (
    lead?.status?.name ||
    statusMap.get(Number(lead?.statusId)) ||
    lead?.statusName ||
    "Statussiz"
  );
}

function pickManagerName(lead) {
  return (
    lead?.assignedUser?.fullName ||
    lead?.assignedUser?.email ||
    lead?.operator?.fullName ||
    lead?.operator?.email ||
    "Tayinlanmagan"
  );
}

function isSuccessfulStatus(name) {
  const n = String(name || "").toLowerCase();
  return (
    n.includes("muvaff") ||
    n.includes("success") ||
    n.includes("sot") ||
    n.includes("zakr") ||
    n.includes("opl") ||
    n.includes("to'lov")
  );
}

function sumBudget(leads) {
  return leads.reduce((acc, x) => acc + Number(x?.budjet || 0), 0);
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("uz-UZ")} so'm`;
}

function dedupeLeadsById(leads) {
  const map = new Map();

  leads.forEach((lead, index) => {
    const key = lead?.id ?? `${lead?.phone || "lead"}-${index}`;
    if (!map.has(key)) map.set(key, lead);
  });

  return [...map.values()];
}

function buildTrend(leads, mode) {
  const now = new Date();
  let count = 14;
  let base;

  if (mode === "day") {
    base = startOfDay(addDays(now, -13));
    count = 14;
  } else if (mode === "week") {
    base = startOfWeek(addDays(now, -7 * 11));
    count = 12;
  } else {
    base = startOfMonth(addMonths(now, -11));
    count = 12;
  }

  const buckets = [];
  const index = new Map();

  for (let i = 0; i < count; i += 1) {
    const d = mode === "month" ? addMonths(base, i) : addDays(base, i * (mode === "week" ? 7 : 1));
    const key = dateKey(d, mode);
    const row = {
      key,
      label: bucketLabel(d, mode),
      active: 0,
      support: 0,
    };
    buckets.push(row);
    index.set(key, row);
  }

  leads.forEach((lead) => {
    const createdAt = parseDate(lead?.createdAt);
    if (!createdAt) return;
    const key = dateKey(createdAt, mode);
    const row = index.get(key);
    if (!row) return;

    row.active += 1;
    if (isSuccessfulStatus(lead.__statusName)) {
      row.support += 1;
    }
  });

  return buckets;
}

async function fetchAllLeadsByStatus(statusId) {
  const LIMIT = 200;
  let page = 1;
  let total = Infinity;
  let loaded = 0;
  const all = [];

  while (loaded < total) {
    const res = await apiFetch(`${API}/leeds/by/${statusId}?page=${page}&limit=${LIMIT}`);
    if (!res || !res.ok) break;

    const json = await res.json();
    const chunk = normalizeLeadsPayload(json);
    if (chunk.length === 0) break;

    all.push(...chunk);

    const metaTotal = Number(json?.meta?.total);
    total = Number.isFinite(metaTotal) && metaTotal > 0 ? metaTotal : loaded + chunk.length;
    loaded += chunk.length;

    if (chunk.length < LIMIT) break;
    page += 1;
  }

  return all;
}

function StatCard({ title, value, caption, icon: Icon, valueClass = "text-slate-100" }) {
  return (
    <div className="rounded-2xl border border-[#2f4e67] bg-gradient-to-br from-[#0b2437] to-[#102f47] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-widest text-slate-400 uppercase">{title}</p>
        <Icon size={15} className="text-cyan-300" />
      </div>
      <p className={`mt-2 text-3xl font-semibold ${valueClass}`}>{value}</p>
      <p className="mt-1 text-[11px] text-slate-500">{caption}</p>
    </div>
  );
}

export default function Analitika() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("week");
  const [rawLeads, setRawLeads] = useState([]);

  const projectId = localStorage.getItem("projectId");

  useEffect(() => {
    const load = async () => {
      if (!projectId) {
        setRawLeads([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const statusRes = await apiFetch(`${API}/status/${projectId}`);
        if (!statusRes) return;
        if (!statusRes.ok) throw new Error(`HTTP ${statusRes.status}`);

        const statuses = await statusRes.json();
        const statusList = normalizeStatusesPayload(statuses).filter((s) =>
          Number.isFinite(Number(s?.id)),
        );
        const statusMap = new Map(
          statusList.map((s) => [Number(s.id), s?.name || `Status #${s?.id}`]),
        );

        const chunks = await Promise.all(
          statusList.map((s) => fetchAllLeadsByStatus(Number(s.id))),
        );

        const leads = dedupeLeadsById(
          chunks.flat().map((x) => ({
            ...x,
            __statusName: pickStatusName(x, statusMap),
          })),
        );

        setRawLeads(leads);
      } catch (e) {
        console.error("Analitika yuklash xatosi:", e);
        setError("Analitika ma'lumotlarini yuklab bo'lmadi");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [projectId]);

  const analytics = useMemo(() => {
    if (!Array.isArray(rawLeads) || rawLeads.length === 0) return FALLBACK;

    const totalDeals = rawLeads.length;
    const totalAmount = sumBudget(rawLeads);

    const byStage = new Map();
    rawLeads.forEach((lead) => {
      const name = lead.__statusName || "Statussiz";
      const item = byStage.get(name) || { name, deals: 0, amount: 0 };
      item.deals += 1;
      item.amount += Number(lead?.budjet || 0);
      byStage.set(name, item);
    });

    const stages = [...byStage.values()]
      .sort((a, b) => b.deals - a.deals)
      .slice(0, 6)
      .map((item, index) => ({
        ...item,
        percent: totalDeals ? Math.round((item.deals / totalDeals) * 100) : 0,
        color: PALETTE[index % PALETTE.length],
      }));

    const byManager = new Map();
    rawLeads.forEach((lead) => {
      const name = pickManagerName(lead);
      const item = byManager.get(name) || { name, deals: 0, amount: 0 };
      item.deals += 1;
      item.amount += Number(lead?.budjet || 0);
      byManager.set(name, item);
    });

    const managers = [...byManager.values()]
      .sort((a, b) => b.deals - a.deals)
      .slice(0, 6)
      .map((item, index) => ({
        ...item,
        percent: totalDeals ? Math.round((item.deals / totalDeals) * 100) : 0,
        color: PALETTE[index % PALETTE.length],
      }));

    const donut = stages.map((s) => ({
      name: s.name,
      value: s.deals,
      color: s.color,
    }));

    return {
      trend: buildTrend(rawLeads, tab),
      stages,
      managers,
      totalDeals,
      totalAmount,
      donut,
    };
  }, [rawLeads, tab]);

  const closedDeals = rawLeads.reduce(
    (acc, lead) => acc + (isSuccessfulStatus(lead.__statusName) ? 1 : 0),
    0,
  );
  const closeRate = analytics.totalDeals
    ? Math.round((closedDeals / analytics.totalDeals) * 100)
    : 0;

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#071828] text-slate-100">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-4 px-4 py-4 pb-8 md:px-6 md:py-5">
        <div className="rounded-2xl border border-[#2f4e67] bg-gradient-to-r from-[#0b2437] to-[#10344c] px-4 py-4 md:px-5 md:py-5">
          <p className="text-xs tracking-widest text-cyan-300/80 uppercase">Analitika</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-100 md:text-2xl">
            Loyiha samaradorligi va deallar dinamikasi
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Barcha metrikalar real lead ma'lumotlari asosida hisoblanmoqda
          </p>
        </div>

        <section className="grid gap-3 md:grid-cols-3">
          <StatCard
            title="Jami Deal"
            value={analytics.totalDeals}
            caption="Barcha leadlar soni"
            icon={Activity}
          />
          <StatCard
            title="Yopilish Darajasi"
            value={`${closeRate}%`}
            caption="Muvaffaqiyatga chiqqanlar ulushi"
            icon={Target}
            valueClass="text-emerald-300"
          />
          <StatCard
            title="Jami Summasi"
            value={formatMoney(analytics.totalAmount)}
            caption="Lead budjetlari yig'indisi"
            icon={Wallet}
            valueClass="text-cyan-300"
          />
        </section>

        <section className="rounded-2xl border border-[#2f4e67] bg-[#0b2437] p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-widest text-cyan-300/70 uppercase">Trend</p>
              <h2 className="text-lg font-semibold text-slate-100">Deal harakati</h2>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-[#355774] bg-[#0f2a40] p-1">
              {TABS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    tab === item.key
                      ? "bg-cyan-500/20 text-cyan-200"
                      : "text-cyan-200/70 hover:bg-white/5 hover:text-cyan-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-[340px] animate-pulse rounded-xl bg-[#123149]" />
          ) : (
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.trend}>
                  <CartesianGrid stroke="#89a6bf2d" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#7aa1bd", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#7aa1bd55" }}
                  />
                  <YAxis
                    tick={{ fill: "#7aa1bd", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#7aa1bd55" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0d1f2f",
                      border: "1px solid #3f6079",
                      color: "#e2e8f0",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    name="Barcha deal"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#0f2231", stroke: "#bae6fd", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="support"
                    name="Yopilgan deal"
                    stroke="#84cc16"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#0f2231", stroke: "#d9f99d", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#2f4e67] bg-[#0b2437] p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-widest text-cyan-300/70 uppercase">Kesim</p>
              <h3 className="text-lg font-semibold text-slate-100">Etaplar va menejerlar</h3>
            </div>
          </div>

          {!!error && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {!loading && analytics.totalDeals === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#0f2a40] p-8 text-center text-slate-300">
              Analitika uchun lead ma'lumotlari topilmadi.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-[#355774] bg-[#0f2a40]/75 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Layers3 size={14} className="text-cyan-300" />
                  <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
                    Etaplar bo'yicha
                  </p>
                </div>
                <div className="space-y-3">
                  {analytics.stages.length === 0 ? (
                    <p className="text-sm text-slate-400">Etaplar bo'yicha ma'lumot yo'q.</p>
                  ) : (
                    analytics.stages.map((item) => (
                      <div key={item.name} className="flex items-start gap-3">
                        <p className="w-12 text-right text-3xl leading-8 font-light text-slate-200">
                          {item.percent}%
                        </p>
                        <div className="mt-1 h-9 w-[2px] rounded" style={{ backgroundColor: item.color }} />
                        <div className="min-w-0">
                          <p className="truncate text-lg leading-none text-slate-100">{item.name}</p>
                          <p className="text-xs text-slate-400">
                            {item.deals} deals, {formatMoney(item.amount)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[#355774] bg-[#0f2a40]/75 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Activity size={14} className="text-cyan-300" />
                  <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
                    Umumiy ulush
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative h-[250px] w-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.donut}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={88}
                          outerRadius={112}
                          startAngle={90}
                          endAngle={-270}
                          paddingAngle={2}
                        >
                          {analytics.donut.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                      <p className="text-xs text-slate-500">{formatMoney(analytics.totalAmount)}</p>
                      <p className="text-5xl font-light text-slate-100">{analytics.totalDeals}</p>
                      <p className="text-sm text-slate-400">Jami deals</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#355774] bg-[#0f2a40]/75 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Users size={14} className="text-cyan-300" />
                  <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
                    Menejer bo'yicha
                  </p>
                </div>
                <div className="space-y-3">
                  {analytics.managers.length === 0 ? (
                    <p className="text-sm text-slate-400">Menejerlar bo'yicha ma'lumot yo'q.</p>
                  ) : (
                    analytics.managers.map((item) => (
                      <div key={item.name} className="flex items-start gap-3">
                        <p className="w-12 text-right text-3xl leading-8 font-light text-slate-200">
                          {item.percent}%
                        </p>
                        <div className="mt-1 h-9 w-[2px] rounded" style={{ backgroundColor: item.color }} />
                        <div className="min-w-0">
                          <p className="truncate text-lg leading-none text-slate-100">{item.name}</p>
                          <p className="text-xs text-slate-400">
                            {item.deals} deals, {formatMoney(item.amount)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
