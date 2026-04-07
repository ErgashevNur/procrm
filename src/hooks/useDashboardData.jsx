import { useState, useEffect } from "react";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeDashboardPayload(payload, selectedPeriodFallback) {
  const json = payload?.data || payload?.result || payload?.payload || payload;

  if (!json || typeof json !== "object") return null;

  return {
    selectedPeriod: json.selectedPeriod || selectedPeriodFallback || "today",
    dateRange: {
      from: json?.dateRange?.from || "",
      to: json?.dateRange?.to || "",
    },
    daily: toNumber(json?.summary?.daily),
    weekly: toNumber(json?.summary?.weekly),
    monthly: toNumber(json?.summary?.monthly),
    totalLeads: toNumber(json?.summary?.total),
    byStatus: {
      new: toNumber(json?.statsInPeriod?.byStatus?.new),
      pending: toNumber(json?.statsInPeriod?.byStatus?.pending),
      success: toNumber(json?.statsInPeriod?.byStatus?.success),
      canceled: toNumber(json?.statsInPeriod?.byStatus?.canceled),
    },
    percentages: {
      new: toNumber(json?.statsInPeriod?.percentages?.new),
      pending: toNumber(json?.statsInPeriod?.percentages?.pending),
      success: toNumber(json?.statsInPeriod?.percentages?.success),
      canceled: toNumber(json?.statsInPeriod?.percentages?.canceled),
    },
    tasks: {
      total: toNumber(json?.tasksInPeriod?.total),
      completed: toNumber(json?.tasksInPeriod?.completed),
      overdue: toNumber(json?.tasksInPeriod?.overdue),
      pending: toNumber(json?.tasksInPeriod?.pending),
      completionRate: toNumber(json?.tasksInPeriod?.completionRate),
    },
  };
}

async function apiFetch(url) {
  const token = localStorage.getItem("user");
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

export default function useDashboardData(navigate) {
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const initialPeriod = searchParams?.get("period") || "today";
  const initialFrom = searchParams?.get("from") || "";
  const initialTo = searchParams?.get("to") || "";
  const periodOptions = new Set(["all", "today", "week", "month", "custom"]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState(
    periodOptions.has(initialPeriod) ? initialPeriod : "today",
  );
  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);
  const projectId = localStorage.getItem("projectId");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (period && period !== "all") params.set("period", period);
    else params.delete("period");

    const useCustomDates = period === "custom" && fromDate && toDate;
    if (useCustomDates) {
      params.set("from", fromDate);
      params.set("to", toDate);
    } else {
      params.delete("from");
      params.delete("to");
    }

    const nextQuery = params.toString();
    const nextUrl = nextQuery
      ? `${window.location.pathname}?${nextQuery}`
      : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [period, fromDate, toDate]);

  useEffect(() => {
    if (projectId) {
      const hasOnlyOneDate = (fromDate && !toDate) || (!fromDate && toDate);
      if (period === "custom" && hasOnlyOneDate) return;

      const load = async () => {
        setLoading(true);
        setError("");
        try {
          const params = new URLSearchParams();
          if (period && period !== "all") params.set("period", period);
          if (period === "custom" && fromDate && toDate) {
            params.set("from", fromDate);
            params.set("to", toDate);
          }

          const res = await apiFetch(
            `${API}/dashboard/crm/leads/statistik/${projectId}?${params.toString()}`,
          );
          if (!res) return;
          if (res.status === 403) {
            navigate("/403", { replace: true });
            return;
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          const normalized = normalizeDashboardPayload(json, period);
          if (!normalized) {
            throw new Error("Dashboard API formati kutilgan ko'rinishda emas");
          }
          setData(normalized);
        } catch (e) {
          console.error(e);
          setError(e?.message || "Dashboard ma'lumotlarini olishda xatolik");
        } finally {
          setLoading(false);
        }
      };
      load();
    } else {
      setData(null);
      setError("Loyiha tanlanmagan");
      setLoading(false);
    }
  }, [projectId, period, fromDate, toDate, navigate]);

  return {
    data,
    loading,
    error,
    period,
    setPeriod,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
  };
}
