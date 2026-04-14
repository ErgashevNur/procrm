export default function FormPreviewField({ field }) {
  if (field.type === "textarea") {
    return (
      <textarea
        disabled
        placeholder={field.placeholder || "Javob..."}
        className="min-h-20 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 outline-none"
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        disabled
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 outline-none"
      >
        <option>Tanlang</option>
        {field.options.map((option, index) => (
          <option key={`${field.id}-${index}`}>{option}</option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300">
        <input type="checkbox" disabled className="accent-blue-500" />
        <span>{field.placeholder || "Tasdiqlash"}</span>
      </label>
    );
  }

  return (
    <input
      disabled
      type={field.type === "phone" ? "tel" : field.type}
      placeholder={field.placeholder || "Javob..."}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 outline-none"
    />
  );
}
