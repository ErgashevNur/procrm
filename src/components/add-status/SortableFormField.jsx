import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export default function SortableFormField({
  field,
  index,
  onUpdate,
  onRemove,
  totalFields,
  formFieldTypes,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-2xl border border-white/10 bg-[#091827] p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="inline-flex h-9 w-9 cursor-grab items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition hover:border-white/20 hover:text-white active:cursor-grabbing"
            aria-label={`Field ${index + 1} ni ko'chirish`}
          >
            <GripVertical size={15} />
          </button>
          <p className="text-sm font-semibold text-white">Field {index + 1}</p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(field.id)}
          className="text-xs font-semibold text-red-300 transition hover:text-red-200"
        >
          O'chirish
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={field.label}
          onChange={(e) => onUpdate(field.id, { label: e.target.value })}
          placeholder="Label"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        />
        <select
          value={field.type}
          onChange={(e) =>
            onUpdate(field.id, {
              type: e.target.value,
              options:
                e.target.value === "select"
                  ? field.options.length
                    ? field.options
                    : ["Variant 1", "Variant 2"]
                  : [],
            })
          }
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        >
          {formFieldTypes.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={field.placeholder}
          onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
          placeholder="Placeholder"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        />
        <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) =>
              onUpdate(field.id, {
                required: e.target.checked,
              })
            }
          />
          Majburiy
        </label>
      </div>

      {field.type === "select" && (
        <textarea
          value={field.options.join("\n")}
          onChange={(e) =>
            onUpdate(field.id, {
              options: e.target.value
                .split("\n")
                .map((option) => option.trim()),
            })
          }
          placeholder="Har bir variantni yangi qatordan yozing"
          className="mt-3 min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        />
      )}

      {totalFields > 1 && (
        <p className="mt-3 text-[11px] text-gray-500">
          Drag & drop qilib field tartibini o'zgartirishingiz mumkin
        </p>
      )}
    </div>
  );
}
