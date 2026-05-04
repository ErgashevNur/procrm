import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  Unplug,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE } from "@/lib/api";
import { toast } from "@/lib/toast";
import {
  getFacebookConnections,
  getFacebookMappingOptions,
  getFacebookOAuthUrl,
  getFacebookPageForms,
  getFacebookPages,
  saveFacebookFormMapping,
  subscribeFacebookPage,
  syncFacebookPages,
} from "@/services/facebookService";

const FB_BLUE = "#1877F2";
const FB_DARK = "#1A2E50";

const DEFAULT_CRM_FIELDS = [
  { value: "FIRST_NAME", label: "Ismi" },
  { value: "LAST_NAME", label: "Familiyasi" },
  { value: "PHONE", label: "Telefon (asosiy)" },
  { value: "EXTRA_PHONE", label: "Telefon (qo'shimcha)" },
  { value: "ADDRESS", label: "Manzil" },
  { value: "BIRTH_DATE", label: "Tug'ilgan kun" },
  { value: "BUDGET", label: "Byudjet" },
  { value: "OTHER", label: "Boshqa" },
];

const FIELD_LABELS = {
  FIRST_NAME: "Ismi",
  LAST_NAME: "Familiyasi",
  PHONE: "Telefon (asosiy)",
  EXTRA_PHONE: "Telefon (qo'shimcha)",
  ADDRESS: "Manzil",
  BIRTH_DATE: "Tug'ilgan kun",
  BUDGET: "Byudjet",
  OTHER: "Boshqa",
};

export default function FacebookConfigDialog({ open, onOpenChange, onSaved }) {
  const projectId = Number(localStorage.getItem("projectId")) || 0;

  const [step, setStep] = useState(1);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const [pages, setPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [subscribingId, setSubscribingId] = useState(null);

  const [selectedPage, setSelectedPage] = useState(null);
  const [forms, setForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  const [mapping, setMapping] = useState({});
  const [crmFields, setCrmFields] = useState(DEFAULT_CRM_FIELDS);
  const [saving, setSaving] = useState(false);

  const openedRef = useRef(false);

  const loadPages = async () => {
    setPagesLoading(true);
    try {
      const list = await getFacebookPages();
      setPages(list);
    } catch (e) {
      toast.error(e?.message || "Sahifalar yuklanmadi");
    } finally {
      setPagesLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      openedRef.current = false;
      return;
    }
    if (openedRef.current) return;
    openedRef.current = true;

    setStep(1);
    setConnected(false);
    setPages([]);
    setSelectedPage(null);
    setForms([]);
    setSelectedForm(null);
    setMapping({});

    (async () => {
      try {
        const connections = await getFacebookConnections();
        if (connections.length > 0) {
          setConnected(true);
          setStep(2);
          loadPages();
        }
      } catch {
        // ulanmagan
      }
    })();

    getFacebookMappingOptions()
      .then((opts) => {
        if (opts?.fields?.length) {
          const mapped = opts.fields.map((f) => ({
            value: f,
            label: FIELD_LABELS[f] || f,
          }));
          setCrmFields(mapped);
        }
      })
      .catch(() => {});
  }, [open]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Backend callbackini redirectUri sifatida o'tkazamiz
      const backendCallback = `${API_BASE}/facebook/oauth/callback`;
      const data = await getFacebookOAuthUrl(backendCallback);
      if (!data?.authUrl) throw new Error("authUrl topilmadi");

      const popup = window.open(
        data.authUrl,
        "fb-oauth",
        "width=600,height=700,top=100,left=100",
      );

      let done = false;

      const finish = (connected) => {
        if (done) return;
        done = true;
        clearInterval(pollInterval);
        clearInterval(closedCheck);
        window.removeEventListener("message", handleMessage);
        popup?.close();
        if (connected) {
          setConnected(true);
          setConnecting(false);
          setStep(2);
          loadPages();
        } else {
          setConnecting(false);
        }
      };

      // postMessage: agar backend frontend callbackimizga redirect qilsa
      const handleMessage = (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type === "FB_CONNECTED") finish(true);
        else if (event.data?.type === "FB_ERROR") {
          finish(false);
          toast.error(event.data.message || "Facebook ulanishda xato");
        }
      };
      window.addEventListener("message", handleMessage);

      // Polling: backend o'zi connection saqladi — biz tekshiramiz
      const pollInterval = setInterval(async () => {
        try {
          const connections = await getFacebookConnections();
          if (connections.length > 0) finish(true);
        } catch {}
      }, 2000);

      // Popup yopilganda bir marta tekshiramiz
      const closedCheck = setInterval(async () => {
        if (!popup?.closed) return;
        clearInterval(closedCheck);
        if (done) return;
        try {
          const connections = await getFacebookConnections();
          finish(connections.length > 0);
        } catch {
          finish(false);
        }
      }, 500);

      // 2 daqiqa timeout
      setTimeout(() => finish(false), 120_000);
    } catch (e) {
      setConnecting(false);
      toast.error(e?.message || "OAuth URL olishda xato");
    }
  };

  const handleSubscribe = async (page) => {
    setSubscribingId(page.id);
    try {
      await subscribeFacebookPage(page.id);
      setPages((prev) =>
        prev.map((p) => (p.id === page.id ? { ...p, isSubscribed: true } : p)),
      );
      toast.success(`"${page.name}" webhook'ga ulandi`);
    } catch (e) {
      toast.error(e?.message || "Subscribe amalga oshmadi");
    } finally {
      setSubscribingId(null);
    }
  };

  const handleSelectPage = async (page) => {
    setSelectedPage(page);
    setForms([]);
    setSelectedForm(null);
    setMapping({});
    setStep(3);
    setFormsLoading(true);
    try {
      const list = await getFacebookPageForms(page.id);
      setForms(list);
    } catch (e) {
      toast.error(e?.message || "Formalar yuklanmadi");
    } finally {
      setFormsLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncFacebookPages();
      await loadPages();
    } catch (e) {
      toast.error(e?.message || "Sync amalga oshmadi");
      setPagesLoading(false);
    } finally {
      setSyncing(false);
    }
  };

  const handleSelectForm = (form) => {
    setSelectedForm(form);
    const initMap = {};
    form.fields?.forEach((f) => {
      initMap[f.key] = "";
    });
    setMapping(initMap);
  };

  const handleSaveMapping = async () => {
    if (!selectedPage || !selectedForm || !projectId) return;
    setSaving(true);
    try {
      const cleanMapping = {};
      Object.entries(mapping).forEach(([k, v]) => {
        if (v) cleanMapping[k] = v;
      });
      await saveFacebookFormMapping(selectedPage.id, selectedForm.externalId, {
        projectId,
        fieldMapping: cleanMapping,
      });
      toast.success("Mapping saqlandi! Leadlar avtomatik tushadi.");
      onSaved?.({ connected: true });
      onOpenChange?.(false);
    } catch (e) {
      toast.error(e?.message || "Mapping saqlanmadi");
    } finally {
      setSaving(false);
    }
  };

  const canSaveMapping =
    selectedForm &&
    projectId &&
    Object.values(mapping).some((v) => !!v);

  const STEPS = ["Ulash", "Sahifalar", "Formalar", "Mapping"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden rounded-2xl border border-[#1a3a6e] bg-[#0a1221] p-0 text-white sm:max-w-2xl">
        <DialogHeader className="border-b border-[#1a3a6e] bg-gradient-to-r from-[#0d1e3a] to-[#091528] px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1a3a6e]"
              style={{ background: FB_DARK }}
            >
              <FontAwesomeIcon
                icon={faFacebook}
                style={{ fontSize: 22, color: FB_BLUE }}
              />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold leading-tight text-white">
                Facebook integratsiyasi
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-gray-400">
                Facebook Lead Ads leadlarini CRM'ga avtomatik ulash
              </DialogDescription>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-0 text-[11px]">
            {STEPS.map((label, i) => (
              <div key={i} className="flex flex-1 items-center">
                <StepDot
                  index={i + 1}
                  label={label}
                  active={step === i + 1}
                  done={step > i + 1}
                />
                {i < STEPS.length - 1 && (
                  <div className="mx-1 h-px flex-1 bg-[#1a3a6e]" />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="min-h-[300px]">
          {step === 1 && (
            <StepConnect
              connected={connected}
              connecting={connecting}
              onConnect={handleConnect}
            />
          )}
          {step === 2 && (
            <StepPages
              pages={pages}
              loading={pagesLoading}
              syncing={syncing}
              subscribingId={subscribingId}
              onSubscribe={handleSubscribe}
              onSelectPage={handleSelectPage}
              onSync={handleSync}
            />
          )}
          {step === 3 && (
            <StepForms
              page={selectedPage}
              forms={forms}
              loading={formsLoading}
              selected={selectedForm}
              onSelect={handleSelectForm}
            />
          )}
          {step === 4 && selectedForm && (
            <StepMapping
              form={selectedForm}
              mapping={mapping}
              crmFields={crmFields}
              onChange={(key, val) =>
                setMapping((prev) => ({ ...prev, [key]: val }))
              }
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[#1a3a6e] bg-[#070f1d] px-5 py-3">
          {step === 1 && (
            <>
              <Button
                variant="ghost"
                className="text-gray-400 hover:bg-white/5 hover:text-white"
                onClick={() => onOpenChange?.(false)}
                disabled={connecting}
              >
                Bekor qilish
              </Button>
              {connected && (
                <Button
                  onClick={() => setStep(2)}
                  style={{ background: FB_BLUE }}
                  className="text-white hover:opacity-90"
                >
                  Keyingisi →
                </Button>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <Button
                variant="ghost"
                className="text-gray-400 hover:bg-white/5 hover:text-white"
                onClick={() => setStep(1)}
              >
                ← Orqaga
              </Button>
              <span className="text-xs text-gray-500">
                Sahifani subscribe qilib, "Sozlash" tugmasini bosing
              </span>
            </>
          )}
          {step === 3 && (
            <>
              <Button
                variant="ghost"
                className="text-gray-400 hover:bg-white/5 hover:text-white"
                onClick={() => {
                  setStep(2);
                  setSelectedPage(null);
                }}
              >
                ← Orqaga
              </Button>
              <Button
                disabled={!selectedForm}
                onClick={() => setStep(4)}
                style={{ background: FB_BLUE }}
                className="text-white hover:opacity-90 disabled:opacity-40"
              >
                Keyingisi →
              </Button>
            </>
          )}
          {step === 4 && (
            <>
              <Button
                variant="ghost"
                className="text-gray-400 hover:bg-white/5 hover:text-white"
                onClick={() => setStep(3)}
                disabled={saving}
              >
                ← Orqaga
              </Button>
              <Button
                onClick={handleSaveMapping}
                disabled={!canSaveMapping || saving}
                style={{ background: canSaveMapping ? FB_BLUE : undefined }}
                className="text-white hover:opacity-90 disabled:opacity-40"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Saqlash
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
        className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
        style={{
          background: active
            ? FB_BLUE
            : done
              ? "#27AE60"
              : "#1a3a6e",
          color: active || done ? "#fff" : "#4a6080",
        }}
      >
        {done ? "✓" : index}
      </span>
      <span
        className="text-[11px]"
        style={{
          color: active ? "#fff" : done ? "#27AE60" : "#4a6080",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function StepConnect({ connected, connecting, onConnect }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-8 py-12">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-2xl border-2"
        style={{ background: FB_DARK, borderColor: connected ? "#27AE60" : "#1a3a6e" }}
      >
        <FontAwesomeIcon
          icon={faFacebook}
          style={{ fontSize: 44, color: connected ? "#27AE60" : FB_BLUE }}
        />
      </div>

      {connected ? (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-[#27AE60]">
            <CheckCircle2 size={18} />
            <span className="font-semibold">Facebook ulandi</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Akkaunt muvaffaqiyatli ulangan. Sahifalarni sozlash uchun davom eting.
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm font-medium text-white">
            Facebook akkauntingizni ulang
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-400">
            Facebook sahifalaringizdagi Lead Ads formalaridan<br />
            leadlarni avtomatik CRM'ga yig'ish uchun ulang.
          </p>
        </div>
      )}

      {!connected && (
        <button
          onClick={onConnect}
          disabled={connecting}
          className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: FB_BLUE }}
        >
          {connecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Ulanmoqda...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faFacebook} style={{ fontSize: 16 }} />
              Facebook bilan ulash
            </>
          )}
        </button>
      )}
    </div>
  );
}

function StepPages({ pages, loading, syncing, subscribingId, onSubscribe, onSelectPage, onSync }) {
  return (
    <div className="px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Subscribe qilingan sahifalardan lead kelsa CRM'ga tushadi.
        </p>
        <button
          onClick={onSync}
          disabled={syncing || loading}
          className="flex items-center gap-1.5 rounded-lg border border-[#1a3a6e] px-3 py-1.5 text-[11px] text-gray-400 transition-colors hover:border-[#2a5a9e] hover:text-white disabled:opacity-40"
        >
          <RefreshCw
            size={11}
            className={syncing ? "animate-spin" : ""}
          />
          Yangilash
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-14 text-gray-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sahifalar yuklanmoqda...
        </div>
      ) : pages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#1a3a6e] py-12 text-center">
          <Unplug size={32} className="mx-auto mb-3 text-gray-700" />
          <p className="text-sm text-gray-400">Facebook sahifalari topilmadi</p>
          <p className="mt-1 text-[11px] text-gray-600">
            "Yangilash" tugmasi orqali sahifalarni yuklang
          </p>
        </div>
      ) : (
        <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex items-center gap-3 rounded-xl border border-[#1a3a6e] bg-[#0d1c35] px-4 py-3 transition-colors hover:border-[#2a5a9e]"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ background: FB_DARK }}
              >
                <FontAwesomeIcon
                  icon={faFacebook}
                  style={{ fontSize: 20, color: FB_BLUE }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {page.name}
                </p>
                <p className="text-[11px] text-gray-500">
                  {page.category || "Facebook sahifasi"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {page.isSubscribed ? (
                  <span className="rounded-full border border-[#1a5c3a] bg-[#0D3320] px-2 py-0.5 text-[10px] font-bold text-[#27AE60]">
                    Ulangan
                  </span>
                ) : (
                  <button
                    onClick={() => onSubscribe(page)}
                    disabled={subscribingId === page.id}
                    className="rounded-lg border border-[#1a3a6e] px-3 py-1.5 text-[11px] font-semibold text-gray-300 transition-all hover:border-[#1877F2] hover:text-white disabled:opacity-40"
                  >
                    {subscribingId === page.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Subscribe"
                    )}
                  </button>
                )}
                <button
                  onClick={() => onSelectPage(page)}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-80"
                  style={{ background: FB_BLUE }}
                >
                  Sozlash
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepForms({ page, forms, loading, selected, onSelect }) {
  return (
    <div className="px-5 py-4">
      <p className="mb-3 text-xs text-gray-400">
        <span className="font-medium text-white">{page?.name}</span> sahifasidagi
        formani tanlang
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-14 text-gray-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Formalar yuklanmoqda...
        </div>
      ) : forms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#1a3a6e] py-12 text-center">
          <FileText size={32} className="mx-auto mb-3 text-gray-700" />
          <p className="text-sm text-gray-400">Bu sahifada forma topilmadi</p>
          <p className="mt-1 text-[11px] text-gray-600">
            Facebook Ads Manager'da Lead forma yarating
          </p>
        </div>
      ) : (
        <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
          {forms.map((form) => {
            const isSelected = selected?.id === form.id;
            return (
              <button
                key={form.id}
                type="button"
                onClick={() => onSelect(form)}
                className="w-full rounded-xl border px-4 py-3 text-left transition-all"
                style={{
                  borderColor: isSelected ? FB_BLUE : "#1a3a6e",
                  background: isSelected ? "rgba(24,119,242,0.08)" : "#0d1c35",
                  boxShadow: isSelected ? `0 0 0 1px ${FB_BLUE}40` : "none",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {form.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      {form.fields?.length || 0} ta maydon ·{" "}
                      <span
                        className="font-medium"
                        style={{
                          color:
                            form.status === "ACTIVE" ? "#27AE60" : "#F59E0B",
                        }}
                      >
                        {form.status === "ACTIVE" ? "Faol" : form.status}
                      </span>
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2
                      size={16}
                      style={{ color: FB_BLUE, flexShrink: 0, marginTop: 2 }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepMapping({ form, mapping, crmFields, onChange }) {
  return (
    <div className="px-5 py-4">
      <p className="mb-3 text-xs text-gray-400">
        <span className="font-medium text-white">{form.name}</span> formasi
        maydonlarini CRM maydonlari bilan bog'lang
      </p>

      <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
        {form.fields?.map((field) => (
          <div
            key={field.key}
            className="grid grid-cols-2 items-center gap-3 rounded-xl border border-[#1a3a6e] bg-[#0d1c35] px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">
                {field.label}
              </p>
              <p className="text-[10px] text-gray-600">{field.key}</p>
            </div>
            <Select
              value={mapping[field.key] || ""}
              onValueChange={(val) => onChange(field.key, val)}
            >
              <SelectTrigger className="h-8 rounded-lg border-[#1a3a6e] bg-[#070f1d] text-xs text-white focus:ring-1 focus:ring-[#1877F2]">
                <SelectValue placeholder="CRM maydoni..." />
              </SelectTrigger>
              <SelectContent className="border-[#1a3a6e] bg-[#0a1221] text-white">
                <SelectItem value="" className="text-xs text-gray-500">
                  — O'tkazib yuborish —
                </SelectItem>
                {crmFields.map((cf) => (
                  <SelectItem
                    key={cf.value}
                    value={cf.value}
                    className="text-xs"
                  >
                    {cf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {!form.fields?.length && (
        <div className="rounded-xl border border-dashed border-[#1a3a6e] py-10 text-center">
          <p className="text-sm text-gray-400">Bu formada maydonlar topilmadi</p>
        </div>
      )}
    </div>
  );
}
