import { ChevronDown, ChevronUp, Hash, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_FIELD_MAPPINGS } from "@/lib/formUtils";

const FIELD_TYPE_LABELS = {
  text: "Text",
  email: "Email",
  phone: "Phone",
  number: "Number",
  textarea: "Textarea",
  select: "Select",
  checkbox: "Checkbox",
};

const HAS_PLACEHOLDER = ["text", "email", "phone", "number", "textarea"];

/**
 * @param {{
 *   field: import("@/types/form").Field,
 *   index: number,
 *   total: number,
 *   onChange: (changes: Partial<import("@/types/form").Field>) => void,
 *   onRemove: () => void,
 *   onMoveUp: () => void,
 *   onMoveDown: () => void,
 * }} props
 */
export default function FieldEditor({
  field,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  usedMappings = new Set(),
}) {
  return (
    <div className="crm-card flex flex-col gap-4 p-4">
      {/* Header row: order controls + type selector + remove */}
      <div className="flex items-start gap-3">
        {/* Up/Down order controls */}
        <div className="flex flex-col items-center gap-0.5 pt-6">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Yuqoriga"
            className="rounded p-0.5 text-[#6a8090] transition-colors hover:bg-[#1e3448] hover:text-[#9ab8cc] disabled:cursor-not-allowed disabled:opacity-20"
          >
            <ChevronUp size={14} />
          </button>
          <span className="text-[10px] font-semibold tabular-nums text-[#456070]">
            {index + 1}
          </span>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Pastga"
            className="rounded p-0.5 text-[#6a8090] transition-colors hover:bg-[#1e3448] hover:text-[#9ab8cc] disabled:cursor-not-allowed disabled:opacity-20"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Field type selector */}
        <div className="flex flex-1 flex-col gap-1.5">
          <Label className="text-xs text-[#9ab8cc]">Field turi</Label>
          <Select
            value={field.type}
            onValueChange={(val) => onChange({ type: val, options: [] })}
          >
            <SelectTrigger className="crm-control h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[#1e3448] bg-[#0d1e2e]">
              {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          title="O'chirish"
          className="mt-6 rounded p-1.5 text-[#e05d5d] transition-colors hover:bg-[#e05d5d1a]"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Label input */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-[#9ab8cc]">
          Label <span className="text-[#e05d5d]">*</span>
        </Label>
        <Input
          className="crm-control h-9 text-sm"
          placeholder="Masalan: Ism"
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </div>

      {/* Placeholder input — text, email, phone, textarea uchun */}
      {HAS_PLACEHOLDER.includes(field.type) && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-[#9ab8cc]">
            Placeholder{" "}
            <span className="text-[#456070]">(ixtiyoriy)</span>
          </Label>
          <Input
            className="crm-control h-9 text-sm"
            placeholder="Masalan: Ismingizni kiriting..."
            value={field.placeholder || ""}
            onChange={(e) => onChange({ placeholder: e.target.value })}
          />
        </div>
      )}

      {/* Options — faqat select uchun */}
      {field.type === "select" && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-[#9ab8cc]">
            Variantlar{" "}
            <span className="text-[#6a8090]">(vergul bilan ajrating)</span>
          </Label>
          <Input
            className="crm-control h-9 text-sm"
            placeholder="Variant 1, Variant 2, Variant 3"
            value={(field.options || []).join(", ")}
            onChange={(e) =>
              onChange({
                options: e.target.value
                  .split(",")
                  .map((o) => o.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
      )}

      {/* Required toggle */}
      <div className="flex items-center gap-3">
        <Switch
          id={`required-${field.id}`}
          checked={field.required}
          onCheckedChange={(checked) => onChange({ required: checked })}
        />
        <Label
          htmlFor={`required-${field.id}`}
          className="cursor-pointer text-sm text-[#9ab8cc]"
        >
          Majburiy
        </Label>
      </div>

      {/* CRM mapping */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-[#9ab8cc]">CRM maydoni</Label>
        <div className="relative">
          <select
            value={field.mapping || ""}
            onChange={(e) => onChange({ mapping: e.target.value })}
            className={`w-full appearance-none rounded-lg border py-2 pl-3 pr-8 text-sm outline-none transition focus:border-blue-400/40 ${
              field.mapping
                ? "border-blue-400/30 bg-blue-500/10 text-blue-200"
                : "border-[#1e3448] bg-[#07111d] text-[#6a8090]"
            }`}
          >
            {LEAD_FIELD_MAPPINGS.map((opt) => {
              const isUsed = opt.value && usedMappings.has(opt.value);
              return (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={isUsed}
                  className="bg-[#0d1e2e] text-white"
                >
                  {opt.label}{isUsed ? " ✓" : ""}
                </option>
              );
            })}
          </select>
          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6a8090]"
            width="12" height="12" viewBox="0 0 12 12" fill="none"
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
