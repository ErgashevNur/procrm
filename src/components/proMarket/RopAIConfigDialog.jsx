import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  Plus,
  Repeat2,
  TrendingUp,
  Trash2,
  TriangleAlert,
  Users,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiUrl } from "@/lib/api";
import { toast } from "@/lib/toast";

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("user");
  const headers = { Authorization: `Bearer ${token}`, ...options.headers };
  if (
    !(options.body instanceof FormData) &&
    !Object.keys(headers).some((k) => k.toLowerCase() === "content-type")
  ) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }
  return res;
}

async function readJson(res, fallback = null) {
  if (!res) return fallback;
  try {
    const text = await res.text();
    if (!text) return fallback;
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function pickArray(payload) {
  const cand = [
    payload,
    payload?.data,
    payload?.items,
    payload?.users,
    payload?.results,
    payload?.result,
    payload?.data?.items,
    payload?.data?.users,
    payload?.data?.results,
    payload?.result?.items,
  ];
  for (const c of cand) if (Array.isArray(c)) return c;
  return [];
}

function pickFirstObject(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] || null;
  if (typeof payload === "object") {
    const arr = pickArray(payload);
    if (arr.length) return arr[0];
    if (payload.id) return payload;
    if (payload.data && typeof payload.data === "object") {
      if (payload.data.id) return payload.data;
    }
  }
  return null;
}

const STRATEGIES = [
  {
    value: "ROUND_ROBIN",
    icon: Repeat2,
    title: "Tartibli (Round Robin)",
    desc: "Operatorlarga navbatma-navbat birma-bir tarqatadi. Yuk teng bo'ladi.",
  },
  {
    value: "KPI_ROBIN",
    icon: TrendingUp,
    title: "Samaradorlik (KPI)",
    desc: "Yaxshi sotayotgan operatorlarga ko'proq, sustlariga kamroq lead beradi.",
  },
];

const PURPLE = "#C084FC";

const DEFAULT_FORM = {
  isActive: true,
  intervalLeads: 5,
  maxNewLeads: 5,
  strategy: "ROUND_ROBIN",
};

let participantUid = 0;

function makeParticipantRow(seed = {}) {
  participantUid += 1;
  return {
    rowId: `p_${Date.now()}_${participantUid}`,
    userId: seed.userId ?? "",
    weight: seed.weight ?? 0,
    isActive: seed.isActive ?? true,
  };
}

export default function RopAIConfigDialog({ open, onOpenChange, onSaved }) {
  const projectId = Number(localStorage.getItem("projectId")) || 0;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submittingStep1, setSubmittingStep1] = useState(false);
  const [submittingStep2, setSubmittingStep2] = useState(false);

  const [configId, setConfigId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const [operators, setOperators] = useState([]);
  const [operatorsLoading, setOperatorsLoading] = useState(false);

  const [participants, setParticipants] = useState([]);

  const openedRef = useRef(false);

  // Reset + load on open
  useEffect(() => {
    if (!open) {
      openedRef.current = false;
      return;
    }
    if (openedRef.current) return;
    openedRef.current = true;

    setStep(1);
    setForm(DEFAULT_FORM);
    setConfigId(null);
    setParticipants([]);

    if (!projectId) {
      toast.error("Loyiha tanlanmagan. Iltimos avval loyihani tanlang.");
      onOpenChange?.(false);
      return;
    }

    const loadAll = async () => {
      setLoading(true);
      setOperatorsLoading(true);
      try {
        const [cfgRes, opsRes] = await Promise.all([
          apiFetch(
            apiUrl(
              `lead-distribution-config?projectId=${projectId}&page=1&limit=10`,
            ),
          ),
          apiFetch(
            apiUrl(`user/all/sales-manager?projectId=${projectId}&limit=200&page=1`),
          ),
        ]);

        const cfgPayload = await readJson(cfgRes, null);
        const existing = pickFirstObject(cfgPayload);
        if (existing && (existing.id ?? existing.configId)) {
          setConfigId(Number(existing.id ?? existing.configId));
          setForm({
            isActive: existing.isActive ?? true,
            intervalLeads: Number(existing.intervalLeads ?? 5),
            maxNewLeads: Number(existing.maxNewLeads ?? 5),
            strategy: existing.strategy || "ROUND_ROBIN",
          });
        }

        const opsPayload = await readJson(opsRes, null);
        const opsArr = pickArray(opsPayload)
          .map((u) => {
            const id = u?.id ?? u?.userId ?? u?._id;
            const fullName =
              u?.fullName ||
              [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim() ||
              u?.name ||
              u?.email ||
              "";
            if (!id) return null;
            return { id: Number(id), fullName, email: u?.email || "" };
          })
          .filter(Boolean);
        setOperators(opsArr);
      } catch (e) {
        console.error(e);
        toast.error("Ma'lumotlarni yuklashda xato");
      } finally {
        setLoading(false);
        setOperatorsLoading(false);
      }
    };

    loadAll();
  }, [open, projectId, onOpenChange]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const totalWeight = useMemo(
    () =>
      participants.reduce((sum, p) => sum + (Number(p.weight) || 0), 0),
    [participants],
  );

  const usedOperatorIds = useMemo(
    () => new Set(participants.map((p) => Number(p.userId)).filter(Boolean)),
    [participants],
  );

  const canSubmitStep1 =
    Number.isFinite(form.intervalLeads) &&
    form.intervalLeads >= 1 &&
    Number.isFinite(form.maxNewLeads) &&
    form.maxNewLeads >= 1 &&
    (form.strategy === "ROUND_ROBIN" || form.strategy === "KPI_ROBIN");

  const validParticipants = participants.filter(
    (p) => Number(p.userId) > 0,
  );
  const canSubmitStep2 = validParticipants.length >= 1;

  const handleStep1Next = async () => {
    if (!canSubmitStep1) {
      toast.error("Barcha maydonlarni to'g'ri to'ldiring");
      return;
    }
    setSubmittingStep1(true);
    try {
      const body = {
        projectId,
        isActive: !!form.isActive,
        intervalLeads: Number(form.intervalLeads),
        maxNewLeads: Number(form.maxNewLeads),
        strategy: form.strategy,
      };

      const isUpdate = Number(configId) > 0;
      const url = isUpdate
        ? apiUrl(`lead-distribution-config/${configId}`)
        : apiUrl("lead-distribution-config");
      const method = isUpdate ? "PATCH" : "POST";

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(body),
      });
      if (!res) return;
      if (!res.ok) {
        const payload = await readJson(res, null);
        const msg =
          payload?.message ||
          (Array.isArray(payload?.message) ? payload.message[0] : null) ||
          "Konfiguratsiyani saqlashda xato";
        toast.error(String(msg));
        return;
      }
      const payload = await readJson(res, null);
      const saved = pickFirstObject(payload) || payload?.data || payload;
      const newId = Number(saved?.id ?? saved?.configId ?? configId);
      if (!newId) {
        toast.error("Konfiguratsiya ID si qaytarilmadi");
        return;
      }
      setConfigId(newId);
      setStep(2);
    } catch (e) {
      console.error(e);
      toast.error("Konfiguratsiyani saqlashda xato");
    } finally {
      setSubmittingStep1(false);
    }
  };

  const handleAddParticipant = () => {
    setParticipants((prev) => [...prev, makeParticipantRow()]);
  };

  const handleUpdateParticipant = (rowId, patch) => {
    setParticipants((prev) =>
      prev.map((p) => (p.rowId === rowId ? { ...p, ...patch } : p)),
    );
  };

  const handleRemoveParticipant = (rowId) => {
    setParticipants((prev) => prev.filter((p) => p.rowId !== rowId));
  };

  const handleSaveAll = async () => {
    if (!canSubmitStep2) {
      toast.error("Kamida bitta operator qo'shing");
      return;
    }
    if (!configId) {
      toast.error("Konfiguratsiya ID topilmadi");
      return;
    }
    setSubmittingStep2(true);
    try {
      const body = {
        configId: Number(configId),
        participants: validParticipants.map((p) => ({
          userId: Number(p.userId),
          weight: Number(p.weight) || 0,
          isActive: !!p.isActive,
        })),
      };
      const res = await apiFetch(
        apiUrl("lead-distribution-participant/bulk-sync"),
        { method: "POST", body: JSON.stringify(body) },
      );
      if (!res) return;
      if (!res.ok) {
        const payload = await readJson(res, null);
        const msg =
          payload?.message ||
          (Array.isArray(payload?.message) ? payload.message[0] : null) ||
          "Operatorlarni saqlashda xato";
        toast.error(String(msg));
        return;
      }
      onSaved?.({ isActive: form.isActive });
      onOpenChange?.(false);
    } catch (e) {
      console.error(e);
      toast.error("Operatorlarni saqlashda xato");
    } finally {
      setSubmittingStep2(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden rounded-2xl border border-[#3a1f5c] bg-[#0f0a1a] p-0 text-white sm:max-w-2xl">
        <DialogHeader className="border-b border-[#3a1f5c] bg-gradient-to-r from-[#1b0f2e] to-[#170927] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#4a1f70] bg-[#2a1840]">
              <Bot size={20} color={PURPLE} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2 text-base font-semibold leading-tight text-white">
                ROP AI sozlamalari
                <span className="rounded-full border border-[#4a1f70] bg-[#2a0d40] px-2 py-0.5 text-[10px] font-bold text-[#C084FC]">
                  Beta
                </span>
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-gray-400">
                Sun'iy intellekt yordamida leadlarni avtomatik tarqatish
              </DialogDescription>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            <StepDot index={1} label="Sozlamalar" active={step === 1} done={step > 1} />
            <div className="h-px flex-1 bg-[#3a1f5c]" />
            <StepDot index={2} label="Operatorlar" active={step === 2} done={false} />
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center px-5 py-16 text-gray-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Yuklanmoqda...
          </div>
        ) : step === 1 ? (
          <Step1
            form={form}
            setField={setField}
            isUpdate={Number(configId) > 0}
          />
        ) : (
          <Step2
            participants={participants}
            operators={operators}
            operatorsLoading={operatorsLoading}
            usedOperatorIds={usedOperatorIds}
            totalWeight={totalWeight}
            strategy={form.strategy}
            onAdd={handleAddParticipant}
            onUpdate={handleUpdateParticipant}
            onRemove={handleRemoveParticipant}
          />
        )}

        <div className="flex items-center justify-between gap-2 border-t border-[#3a1f5c] bg-[#0b0716] px-5 py-3">
          {step === 1 ? (
            <>
              <Button
                variant="ghost"
                className="text-gray-400 hover:bg-white/5 hover:text-white"
                onClick={() => onOpenChange?.(false)}
                disabled={submittingStep1}
              >
                Bekor qilish
              </Button>
              <Button
                onClick={handleStep1Next}
                disabled={!canSubmitStep1 || submittingStep1 || loading}
                className="bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-50"
              >
                {submittingStep1 ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>Keyingisi →</>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-gray-400 hover:bg-white/5 hover:text-white"
                onClick={() => setStep(1)}
                disabled={submittingStep2}
              >
                ← Orqaga
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={!canSubmitStep2 || submittingStep2}
                className="bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-50"
              >
                {submittingStep2 ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Saqlash va yoqish
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepDot({ index, label, active, done }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
          active
            ? "bg-[#7c3aed] text-white"
            : done
              ? "bg-[#27AE60] text-white"
              : "bg-[#2a1840] text-gray-500"
        }`}
      >
        {done ? "✓" : index}
      </span>
      <span
        className={`text-[11px] ${
          active ? "text-white" : done ? "text-[#27AE60]" : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function Step1({ form, setField, isUpdate }) {
  return (
    <div className="max-h-[60vh] overflow-y-auto px-5 py-4 space-y-5">
      {/* Strategy */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-300">
          Tarqatish strategiyasi
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {STRATEGIES.map((s) => {
            const Icon = s.icon;
            const selected = form.strategy === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setField("strategy", s.value)}
                className={`relative rounded-xl border p-3 text-left transition-all ${
                  selected
                    ? "border-[#7c3aed] bg-[#1a0d2e] ring-1 ring-[#7c3aed]/40"
                    : "border-[#2a1840] bg-[#11091e] hover:border-[#4a1f70]"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      selected
                        ? "bg-[#7c3aed]/20 text-[#C084FC]"
                        : "bg-[#1a1028] text-gray-500"
                    }`}
                  >
                    <Icon size={14} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-semibold ${
                        selected ? "text-white" : "text-gray-300"
                      }`}
                    >
                      {s.title}
                    </div>
                    <div className="mt-1 text-[11px] leading-relaxed text-gray-500">
                      {s.desc}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* isActive switch */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#2a1840] bg-[#11091e] px-4 py-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-white">ROP AI faol</div>
          <div className="mt-0.5 text-[11px] text-gray-500">
            O'chirilsa, AI lead tarqatishni to'xtatadi (ma'lumotlar saqlanadi)
          </div>
        </div>
        <Switch
          checked={!!form.isActive}
          onCheckedChange={(v) => setField("isActive", v)}
        />
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-300">
            Boshlash chegarasi (intervalLeads)
          </label>
          <Input
            type="number"
            min={1}
            value={form.intervalLeads}
            onChange={(e) =>
              setField("intervalLeads", Number(e.target.value) || 0)
            }
            className="border-[#2a1840] bg-[#11091e] text-sm text-white placeholder-gray-600 focus-visible:border-[#7c3aed] focus-visible:ring-[#7c3aed]/30"
          />
          <p className="text-[10.5px] leading-snug text-gray-500">
            Tarqatish kamida shu sondagi yangi lead kelganda boshlanadi
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-300">
            Operatorga maksimum (maxNewLeads)
          </label>
          <Input
            type="number"
            min={1}
            value={form.maxNewLeads}
            onChange={(e) =>
              setField("maxNewLeads", Number(e.target.value) || 0)
            }
            className="border-[#2a1840] bg-[#11091e] text-sm text-white placeholder-gray-600 focus-visible:border-[#7c3aed] focus-visible:ring-[#7c3aed]/30"
          />
          <p className="text-[10.5px] leading-snug text-gray-500">
            Bitta operatorda shu sondan ortiq yangi lead bo'lsa, yangi
            berilmaydi
          </p>
        </div>
      </div>

      {isUpdate && (
        <div className="flex items-start gap-2 rounded-lg border border-[#4a1f70]/40 bg-[#2a0d40]/30 px-3 py-2 text-[11px] text-[#C084FC]">
          <Sparkles size={13} className="mt-0.5 shrink-0" />
          <span>
            Sozlamalar yangilanadi. Operatorlar ro'yxatini keyingi qadamda
            qayta tasdiqlang.
          </span>
        </div>
      )}
    </div>
  );
}

function Step2({
  participants,
  operators,
  operatorsLoading,
  usedOperatorIds,
  totalWeight,
  strategy,
  onAdd,
  onUpdate,
  onRemove,
}) {
  const totalColor =
    totalWeight === 100
      ? "text-[#27AE60] border-[#27AE60]/40 bg-[#27AE60]/10"
      : totalWeight > 100
        ? "text-[#E74C3C] border-[#E74C3C]/40 bg-[#E74C3C]/10"
        : "text-[#F59E0B] border-[#F59E0B]/40 bg-[#F59E0B]/10";

  const strategyHint =
    strategy === "KPI_ROBIN"
      ? "KPI rejimi: foiz qancha katta bo'lsa, shuncha ko'p lead beriladi."
      : "Tartibli rejim: foizlar nisbatda hisobga olinadi, lekin tarqatish navbatma-navbat boradi.";

  return (
    <div className="max-h-[60vh] overflow-y-auto px-5 py-4 space-y-3">
      <div className="flex items-start gap-2 rounded-lg border border-[#2a1840] bg-[#11091e] px-3 py-2">
        <Users size={14} className="mt-0.5 shrink-0 text-[#C084FC]" />
        <div className="text-[11px] leading-relaxed text-gray-400">
          Leadlar qaysi operatorlarga tarqatilishini tanlang. Har bir operator
          uchun foiz ulushi (0–100) belgilang.{" "}
          <span className="text-gray-500">{strategyHint}</span>
        </div>
      </div>

      {operatorsLoading ? (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Operatorlar yuklanmoqda...
        </div>
      ) : operators.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#3a1f5c] py-10 text-center">
          <Users size={28} className="mx-auto mb-3 text-gray-700" />
          <p className="text-sm text-gray-400">Operatorlar topilmadi</p>
          <p className="mt-1 text-[11px] text-gray-600">
            Avval Sozlamalar &gt; Foydalanuvchilar bo'limidan sales-manager
            qo'shing
          </p>
        </div>
      ) : (
        <>
          {participants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#3a1f5c] py-8 text-center">
              <p className="text-xs text-gray-500">
                Hali operator qo'shilmagan
              </p>
              <button
                type="button"
                onClick={onAdd}
                className="mt-2 text-[11px] text-[#C084FC] underline underline-offset-2 hover:text-white"
              >
                + Birinchi operatorni qo'shing
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {participants.map((p, idx) => (
                <ParticipantRow
                  key={p.rowId}
                  index={idx}
                  participant={p}
                  operators={operators}
                  usedOperatorIds={usedOperatorIds}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={onAdd}
              disabled={participants.length >= operators.length}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#4a1f70] px-3 py-1.5 text-[11px] text-[#C084FC] transition-colors hover:border-[#7c3aed] hover:bg-[#1a0d2e] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={12} /> Operator qo'shish
            </button>

            {participants.length > 0 && (
              <div
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${totalColor}`}
              >
                Jami: {totalWeight}%
              </div>
            )}
          </div>

          {participants.length > 0 && totalWeight !== 100 && (
            <div className="flex items-start gap-2 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/5 px-3 py-2 text-[11px] text-[#F59E0B]">
              <TriangleAlert size={13} className="mt-0.5 shrink-0" />
              <span>
                Foizlar yig'indisi 100% bo'lishi tavsiya etiladi (hozir{" "}
                {totalWeight}%). Backend nisbatga qarab moslab oladi.
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ParticipantRow({
  index,
  participant,
  operators,
  usedOperatorIds,
  onUpdate,
  onRemove,
}) {
  const currentId = Number(participant.userId) || 0;
  const availableOperators = operators.filter(
    (op) => op.id === currentId || !usedOperatorIds.has(op.id),
  );

  return (
    <div className="grid grid-cols-12 items-center gap-2 rounded-xl border border-[#2a1840] bg-[#11091e] p-2.5">
      <span className="col-span-1 text-center text-[11px] text-gray-600">
        {index + 1}
      </span>

      <div className="col-span-5">
        <Select
          value={currentId ? String(currentId) : ""}
          onValueChange={(v) =>
            onUpdate(participant.rowId, { userId: Number(v) })
          }
        >
          <SelectTrigger className="h-9 w-full rounded-lg border-[#2a1840] bg-[#0f0a1a] text-xs text-white focus-visible:border-[#7c3aed] focus-visible:ring-[#7c3aed]/30">
            <SelectValue placeholder="Operatorni tanlang" />
          </SelectTrigger>
          <SelectContent className="border-[#2a1840] bg-[#0f0a1a] text-white">
            {availableOperators.length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-gray-500">
                Boshqa operator qolmadi
              </div>
            ) : (
              availableOperators.map((op) => (
                <SelectItem key={op.id} value={String(op.id)}>
                  <div className="flex flex-col">
                    <span className="text-xs">
                      {op.fullName || `#${op.id}`}
                    </span>
                    {op.email && (
                      <span className="text-[10px] text-gray-500">
                        {op.email}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="relative col-span-3">
        <Input
          type="number"
          min={0}
          max={100}
          value={participant.weight}
          onChange={(e) =>
            onUpdate(participant.rowId, {
              weight: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
            })
          }
          className="h-9 rounded-lg border-[#2a1840] bg-[#0f0a1a] pr-6 text-right text-xs text-white focus-visible:border-[#7c3aed] focus-visible:ring-[#7c3aed]/30"
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">
          %
        </span>
      </div>

      <div className="col-span-2 flex items-center justify-center">
        <Switch
          size="sm"
          checked={!!participant.isActive}
          onCheckedChange={(v) =>
            onUpdate(participant.rowId, { isActive: v })
          }
        />
      </div>

      <button
        type="button"
        onClick={() => onRemove(participant.rowId)}
        className="col-span-1 flex h-8 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-[#E74C3C]/10 hover:text-[#E74C3C]"
        aria-label="O'chirish"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
