import { Input } from "@/components/ui/input";
import PhoneInput from "@/components/ui/PhoneInput";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const TYPE_BADGE = {
  text: "T",
  email: "@",
  phone: "☎",
  number: "#",
  textarea: "¶",
  select: "▾",
  checkbox: "☑",
};

/**
 * @param {{ fields: import("@/types/form").Field[] }} props
 */
export default function FormPreview({ fields }) {
  if (fields.length === 0) {
    return (
      <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-[#1e3448] text-sm text-[#456070]">
        Fieldlar qo'shilganda preview shu yerda chiqadi
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#1e3448] text-[9px] font-bold text-[#6a8090]">
              {TYPE_BADGE[field.type] ?? "?"}
            </span>
            <Label className="text-sm text-[#c8dde8]">
              {field.label || (
                <span className="italic text-[#456070]">Label kiritilmagan</span>
              )}
              {field.required && (
                <span className="ml-1 text-[#e05d5d]">*</span>
              )}
            </Label>
          </div>

          {field.type === "text" && (
            <Input
              className="crm-control h-9 text-sm"
              placeholder={field.placeholder || field.label || ""}
              disabled
            />
          )}

          {field.type === "email" && (
            <Input
              type="email"
              className="crm-control h-9 text-sm"
              placeholder={field.placeholder || field.label || "email@example.com"}
              disabled
            />
          )}

          {field.type === "number" && (
            <Input
              type="number"
              min={0}
              className="crm-control h-9 text-sm"
              placeholder={field.placeholder || "0"}
              disabled
            />
          )}

          {field.type === "phone" && (
            <PhoneInput
              value=""
              disabled
              placeholder={field.placeholder || "90 123 45 67"}
            />
          )}

          {field.type === "textarea" && (
            <Textarea
              className="crm-control resize-none text-sm"
              rows={3}
              placeholder={field.placeholder || field.label || ""}
              disabled
            />
          )}

          {field.type === "select" && (
            <Select disabled>
              <SelectTrigger className="crm-control h-9 text-sm">
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
                id={`preview-${field.id}-${index}`}
                disabled
                className="h-4 w-4 rounded border-[#1e3448] accent-[#69a7ff]"
              />
              <label
                htmlFor={`preview-${field.id}-${index}`}
                className="text-sm text-[#9ab8cc]"
              >
                {field.label}
              </label>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
