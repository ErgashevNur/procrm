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

export default function FormPageField({
  field,
  fieldValues,
  setFieldValue,
}) {
  return (
    <div className="flex flex-col gap-1.5">
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

      {(field.type === "email" || field.type === "phone") && (
        <Input
          type={field.type === "phone" ? "tel" : field.type}
          className="crm-control h-10"
          placeholder={field.placeholder || field.label}
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
  );
}
