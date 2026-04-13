export default function TInput({
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  ...rest
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      {...rest}
      className="w-full rounded-xl border border-white/[0.07] bg-[#0a1929] px-3 py-2.5 text-sm text-white transition-all outline-none placeholder:text-gray-600 focus:border-[#3b82f6]"
    />
  );
}
