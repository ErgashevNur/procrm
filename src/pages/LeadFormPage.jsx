import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import KotibamLoader from "@/components/KotibamLoader";
import PhoneInput from "@/components/ui/PhoneInput";
import {
  normalizeFormPayload,
  inferLeadPayload,
  normalizeUzPhone,
  buildSubmitPayload,
} from "@/lib/formUtils";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

export default function LeadFormPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const [fieldValues, setFieldValues] = useState({});

  useEffect(() => {
    if (!submitted || !form?.telegramUrl) return;
    let count = 5;
    setRedirectCountdown(count);
    const interval = setInterval(() => {
      count -= 1;
      setRedirectCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        window.location.href = form.telegramUrl;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, form?.telegramUrl]);

  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch(`${API}/form-template/public/${id}`);
        if (!res.ok) throw new Error("Forma topilmadi");
        const data = await res.json();
        const normalized = normalizeFormPayload(data);
        setForm(normalized);
        const init = {};
        (normalized.fields || []).forEach((f) => {
          init[f.id] = f.type === "checkbox" ? false : "";
        });
        setFieldValues(init);
      } catch (err) {
        setError(err.message || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [id]);

  function setFieldValue(fieldId, value) {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const requiredMissing = (form.fields || []).find(
      (f) =>
        f.required &&
        (fieldValues[f.id] === "" ||
          fieldValues[f.id] === false ||
          fieldValues[f.id] == null),
    );
    if (requiredMissing) {
      toast.error(`"${requiredMissing.label}" majburiy maydon`);
      return;
    }

    const leadPayload = inferLeadPayload(form.fields || [], fieldValues);
    if (!leadPayload.firstName) {
      toast.error("Ism maydonini to'ldiring");
      return;
    }
    const normalizedPhone = normalizeUzPhone(leadPayload.phone);
    if (!normalizedPhone) {
      toast.error("Telefon raqamini to'ldiring");
      return;
    }
    const numericPhone = Number(normalizedPhone.replace(/\D/g, ""));
    if (!Number.isFinite(numericPhone)) {
      toast.error("Telefon raqam noto'g'ri formatda");
      return;
    }

    const { payload } = buildSubmitPayload({
      form,
      fields: form.fields || [],
      fieldValues,
    });

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/form-template/public/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Yuborishda xatolik");
      }
      setSubmitted(true);
    } catch (err) {
      if (err instanceof TypeError) {
        toast.error("Tarmoqqa ulanishda xatolik yuz berdi");
      } else {
        toast.error(err.message || "Xatolik yuz berdi");
      }
    } finally {
      setSubmitting(false);
    }
  }

  /* ——— Loading ——— */
  if (loading) return <KotibamLoader fullScreen />;

  /* ——— Error ——— */
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020711] px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#2a1010]">
            <svg className="h-7 w-7 text-[#e05d5d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="mb-1 text-lg font-semibold text-white">Forma topilmadi</p>
          <p className="text-sm text-[#9ab8cc]">{error}</p>
        </div>
      </div>
    );
  }

  /* ——— Success ——— */
  if (submitted) {
    const hasTelegram = Boolean(form?.telegramUrl);
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020711] px-4">
        <div
          className="pointer-events-none fixed inset-0"
          style={{ background: "radial-gradient(circle at top, rgba(74,222,128,0.06), transparent 40%)" }}
        />
        <div className="relative w-full max-w-md">
          <div className="overflow-hidden rounded-[28px] border border-[#1a4a2a] bg-[linear-gradient(180deg,rgba(10,32,16,0.98),rgba(5,16,8,0.99))] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
            {/* Animated check icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1a4a2a] shadow-[0_0_40px_rgba(74,222,128,0.25)]">
              <svg className="h-10 w-10 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="mb-3 text-2xl font-bold text-white">
              Arizangiz qabul qilindi!
            </h2>
            <p className="mb-1 text-sm leading-6 text-[#9ab8cc]">
              Operatorlarimiz{" "}
              <span className="font-semibold text-white">1-2 kun</span> ichida
              siz bilan bog'lanishadi.
            </p>
            <p className="text-sm text-[#6a8090]">
              Iltimos, telefon raqamingizni faol ushlab turing.
            </p>

            {/* Divider */}
            <div className="my-6 h-px bg-[#1a4a2a]" />

            {/* Info row */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#456070]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
              <span>Ariza muvaffaqiyatli ro'yxatdan o'tdi</span>
            </div>

            {/* Telegram redirect */}
            {hasTelegram && redirectCountdown !== null && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-[#1a3a4a] bg-[#091827] px-4 py-3 text-sm text-[#9ab8cc]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-[#229ED9]">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.12 14.367l-2.95-.924c-.64-.204-.654-.64.136-.953l11.527-4.444c.533-.194 1.001.13.73.201z" />
                  </svg>
                  {redirectCountdown > 0
                    ? `${redirectCountdown} soniyada Telegram kanaliga o'tasiz...`
                    : "Yo'naltirilmoqda..."}
                </div>
                <button
                  onClick={() => (window.location.href = form.telegramUrl)}
                  className="text-xs text-[#229ED9] underline underline-offset-2 hover:no-underline"
                >
                  Hozir o'tish
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ——— Form ——— */
  return (
    <div className="min-h-screen bg-[#020711] px-4 py-10">
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(circle at top, rgba(106,167,255,0.08), transparent 40%)" }}
      />

      <div className="relative mx-auto w-full max-w-lg">
        {/* Header card */}
        <div className="mb-6 overflow-hidden rounded-[28px] border border-[#1e3448] bg-[linear-gradient(180deg,rgba(15,34,49,0.94),rgba(9,22,34,0.96))] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          {form.headerImage?.dataUrl && (
            <div className="relative aspect-[8/3] w-full overflow-hidden border-b border-white/10 bg-[#07111d]">
              <img src={form.headerImage.dataUrl} alt={form.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,7,17,0.04),rgba(2,7,17,0.55))]" />
            </div>
          )}
          <div className="px-6 py-6 text-center">
            <p className="text-[11px] font-semibold tracking-[0.32em] text-[#7e9bb1] uppercase">
              Bepul konsultatsiya
            </p>
            <h1 className="mt-3 text-2xl font-bold text-white">{form.title}</h1>
            {form.description ? (
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#9ab8cc]">
                {form.description}
              </p>
            ) : (
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6a8090]">
                Quyidagi maydonlarni to'ldiring va mutaxassislarimiz siz bilan bog'lanishadi.
              </p>
            )}
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-[28px] border border-[#1e3448] bg-[#0d1e2e] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
        >
          {(form.fields || []).map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <Label className="text-sm text-[#9ab8cc]">
                {field.label}
                {field.required && <span className="ml-1 text-[#e05d5d]">*</span>}
              </Label>

              {field.type === "text" && (
                <Input
                  className="crm-control h-10"
                  placeholder={field.placeholder || field.label}
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                />
              )}

              {field.type === "phone" && (
                <PhoneInput
                  value={fieldValues[field.id] ?? ""}
                  onChange={(digits) => setFieldValue(field.id, digits)}
                />
              )}

              {field.type === "email" && (
                <Input
                  type="email"
                  className="crm-control h-10"
                  placeholder={field.placeholder || field.label}
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                />
              )}

              {field.type === "number" && (
                <Input
                  type="number"
                  min={0}
                  className="crm-control h-10"
                  placeholder={field.placeholder || "0"}
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                />
              )}

              {field.type === "textarea" && (
                <Textarea
                  className="crm-control resize-none"
                  rows={3}
                  placeholder={field.placeholder || field.label}
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                />
              )}

              {field.type === "select" && (
                <Select
                  value={fieldValues[field.id] ?? ""}
                  onValueChange={(val) => setFieldValue(field.id, val)}
                >
                  <SelectTrigger className="crm-control h-10">
                    <SelectValue placeholder="Tanlang..." />
                  </SelectTrigger>
                  <SelectContent className="border-[#1e3448] bg-[#0d1e2e]">
                    {(field.options || []).map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === "checkbox" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`field-${field.id}`}
                    checked={!!fieldValues[field.id]}
                    onChange={(e) => setFieldValue(field.id, e.target.checked)}
                    className="h-4 w-4 rounded accent-[#69a7ff]"
                  />
                  <label htmlFor={`field-${field.id}`} className="cursor-pointer text-sm text-[#9ab8cc]">
                    {field.label}
                  </label>
                </div>
              )}
            </div>
          ))}

          {(form.fields || []).length === 0 && (
            <div className="rounded-xl border border-dashed border-[#1e3448] px-4 py-6 text-center text-sm text-[#9ab8cc]">
              Bu formada hali maydon yo'q
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-[#69a7ff] py-3.5 text-sm font-semibold text-[#020711] transition-all hover:bg-[#88bbff] hover:shadow-[0_4px_20px_rgba(105,167,255,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                Yuborilmoqda...
              </span>
            ) : (
              "Ariza qoldirish"
            )}
          </button>

          {/* Reassurance text */}
          <p className="text-center text-[11px] text-[#456070]">
            Arizangiz qabul qilingach, operatorlarimiz 1-2 kun ichida bog'lanishadi
          </p>
        </form>
      </div>
    </div>
  );
}
