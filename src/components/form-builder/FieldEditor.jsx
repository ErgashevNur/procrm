import { Trash2 } from "lucide-react";
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

/**
 * @param {{ field: import("@/types/form").Field, onChange: (changes: Partial<import("@/types/form").Field>) => void, onRemove: () => void }} props
 */
export default function FieldEditor({ field, onChange, onRemove }) {
  return (
    <div className="crm-card flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-3">
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
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="textarea">Textarea</SelectItem>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="mt-6 rounded p-1.5 text-[#e05d5d] transition-colors hover:bg-[#e05d5d1a]"
          title="O'chirish"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Label input */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-[#9ab8cc]">Label</Label>
        <Input
          className="crm-control h-9 text-sm"
          placeholder="Masalan: Ism"
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </div>

      {/* Options input — only for select type */}
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
    </div>
  );
}
