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
import { toast } from "sonner";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

export default function FormPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fixed fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Dynamic field values: { [fieldId]: value }
  const [fieldValues, setFieldValues] = useState({});

  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch(`${API}/form-template/public/${id}`);
        if (!res.ok) throw new Error("Forma topilmadi");
        const data = await res.json();
        setForm(data);

        // Init field values
        const init = {};
        (data.fields || []).forEach((f) => {
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

    if (!firstName.trim()) {
      toast.error("Ism kiritish majburiy");
      return;
    }
    if (!lastName.trim()) {
      toast.error("Familiya kiritish majburiy");
      return;
    }
    if (!phone.trim()) {
      toast.error("Telefon raqam kiritish majburiy");
      return;
    }

    // Check required custom fields
    const requiredMissing = (form.fields || []).find(
      (f) =>
        f.required &&
        (fieldValues[f.id] === "" ||
          fieldValues[f.id] === false ||
          fieldValues[f.id] == null)
    );
    if (requiredMissing) {
      toast.error(`"${requiredMissing.label}" majburiy field`);
      return;
    }

    // Build otherDetails from custom fields
    const otherDetails = {};
    (form.fields || []).forEach((f) => {
      otherDetails[f.label || f.id] = fieldValues[f.id];
    });

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/form-template/public/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadSourceId: 1,
          projectId: form.projectId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          otherDetails,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Yuborishda xatolik");
      }

      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  }

  /* ——— Loading ——— */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020711]">
        <div className="text-sm text-[#9ab8cc]">Yuklanmoqda...</div>
      </div>
    );
  }

  /* ——— Error ——— */
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020711]">
        <div className="text-center">
          <p className="mb-2 text-lg font-semibold text-white">Xatolik</p>
          <p className="text-sm text-[#9ab8cc]">{error}</p>
        </div>
      </div>
    );
  }

  /* ——— Success ——— */
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020711] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#1a4a2a] bg-[#0a2010] p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1a4a2a]">
            <svg
              className="h-7 w-7 text-[#4ade80]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">
            Muvaffaqiyatli yuborildi!
          </h2>
          <p className="text-sm text-[#9ab8cc]">
            Arizangiz qabul qilindi. Tez orada siz bilan bog'lanamiz.
          </p>
        </div>
      </div>
    );
  }

  /* ——— Form ——— */
  return (
    <div className="min-h-screen bg-[#020711] px-4 py-10">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(circle at top, rgba(106,167,255,0.1), transparent 40%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">{form.title}</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-[#1e3448] bg-[#0d1e2e] p-6"
        >
          {/* Fixed fields */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-[#9ab8cc]">
              Ism <span className="text-[#e05d5d]">*</span>
            </Label>
            <Input
              className="crm-control h-10"
              placeholder="Ismingizni kiriting"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-[#9ab8cc]">
              Familiya <span className="text-[#e05d5d]">*</span>
            </Label>
            <Input
              className="crm-control h-10"
              placeholder="Familiyangizni kiriting"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-[#9ab8cc]">
              Telefon <span className="text-[#e05d5d]">*</span>
            </Label>
            <Input
              className="crm-control h-10"
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Custom fields */}
          {(form.fields || []).map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <Label className="text-sm text-[#9ab8cc]">
                {field.label}
                {field.required && (
                  <span className="ml-1 text-[#e05d5d]">*</span>
                )}
              </Label>

              {field.type === "text" && (
                <Input
                  className="crm-control h-10"
                  placeholder={field.label}
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                />
              )}

              {field.type === "textarea" && (
                <Textarea
                  className="crm-control resize-none"
                  rows={3}
                  placeholder={field.label}
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
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
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
                  <label
                    htmlFor={`field-${field.id}`}
                    className="cursor-pointer text-sm text-[#9ab8cc]"
                  >
                    {field.label}
                  </label>
                </div>
              )}
            </div>
          ))}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg bg-[#69a7ff] py-3 text-sm font-semibold text-[#020711] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Yuborilmoqda..." : "Yuborish"}
          </button>
        </form>
      </div>
    </div>
  );
}
