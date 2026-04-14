export default function FormField({
  label,
  required = false,
  icon: Icon,
  error,
  children,
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium tracking-wider text-gray-500 uppercase">
        {Icon ? <Icon size={11} className="text-gray-600" /> : null}
        {label} {required ? <span className="text-red-400">*</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1 text-[11px] text-red-400">{error}</p> : null}
    </div>
  );
}
