import { useState } from "react";
import { Plus, Copy, Check, Link } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldEditor from "@/components/form-builder/FieldEditor";
import FormPreview from "@/components/form-builder/FormPreview";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

function createEmptyField() {
  return {
    id: crypto.randomUUID(),
    type: "text",
    label: "",
    required: false,
    options: [],
  };
}

export default function FormBuilder() {
  const projectId = Number(localStorage.getItem("projectId")) || 0;
  const [title, setTitle] = useState("");
  const [fields, setFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const [formLink, setFormLink] = useState(null);
  const [copied, setCopied] = useState(false);

  function addField() {
    setFields((prev) => [...prev, createEmptyField()]);
  }

  function updateField(id, changes) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...changes } : f))
    );
  }

  function removeField(id) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Forma nomini kiriting");
      return;
    }
    if (fields.length === 0) {
      toast.error("Kamida bitta field qo'shing");
      return;
    }
    const emptyLabel = fields.find((f) => !f.label.trim());
    if (emptyLabel) {
      toast.error("Barcha fieldlarga label kiriting");
      return;
    }

    const token = localStorage.getItem("user");
    setSaving(true);

    try {
      const res = await fetch(`${API}/form-template`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          name: title.trim(),
          isActive: true,
          fields: fields.map((f, index) => ({
            label: f.label,
            placeholder: "",
            fieldType: f.type.toUpperCase(),
            isRequired: f.required,
            order: index,
            options:
              f.type === "select"
                ? (f.options || []).reduce(
                    (acc, opt, i) => ({ ...acc, [String(i)]: opt }),
                    {}
                  )
                : {},
          })),
        }),
      });

      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Saqlashda xatolik");
      }

      const data = await res.json();
      const link = `${window.location.origin}/form/${data.id}`;
      setFormLink(link);
      toast.success("Forma muvaffaqiyatli yaratildi!");
    } catch (err) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    if (!formLink) return;
    navigator.clipboard.writeText(formLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="crm-page">
      <div className="mb-6">
        <p className="crm-kicker">Admin</p>
        <h1 className="crm-title">Form Builder</h1>
        <p className="crm-subtitle">Yangi forma yarating va link oling</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ——— LEFT: editor ——— */}
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="crm-card p-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#9ab8cc]">Forma nomi</Label>
              <Input
                className="crm-control h-10"
                placeholder="Masalan: Konsultatsiya uchun ariza"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-3">
            {fields.map((field) => (
              <FieldEditor
                key={field.id}
                field={field}
                onChange={(changes) => updateField(field.id, changes)}
                onRemove={() => removeField(field.id)}
              />
            ))}
          </div>

          {/* Add field + Save */}
          <div className="flex gap-3">
            <button
              onClick={addField}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-[#1e3448] py-3 text-sm text-[#9ab8cc] transition-colors hover:border-[#69a7ff] hover:text-[#69a7ff]"
            >
              <Plus size={16} />
              Field qo'shish
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-[#69a7ff] px-6 py-3 text-sm font-semibold text-[#020711] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>

          {/* Success link card */}
          {formLink && (
            <div className="crm-card flex flex-col gap-3 border-[#1a4a2a] bg-[#0a2010] p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#4ade80]" />
                <span className="text-sm font-medium text-[#4ade80]">
                  Forma muvaffaqiyatli yaratildi!
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[#1a4a2a] bg-[#051008] px-3 py-2">
                <Link size={14} className="shrink-0 text-[#6a8090]" />
                <span className="flex-1 truncate text-xs text-[#9ab8cc]">
                  {formLink}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex shrink-0 items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors hover:bg-[#1a4a2a]"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-[#4ade80]" />
                      <span className="text-[#4ade80]">Nusxalandi</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} className="text-[#9ab8cc]" />
                      <span className="text-[#9ab8cc]">Nusxalash</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ——— RIGHT: preview ——— */}
        <div className="flex flex-col gap-4">
          <div className="crm-card p-4">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#456070]">
              Preview
            </p>
            {title && (
              <h2 className="mb-4 text-base font-semibold text-white">
                {title}
              </h2>
            )}
            <FormPreview fields={fields} />
          </div>
        </div>
      </div>
    </div>
  );
}
