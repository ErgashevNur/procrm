function formatDisplay(raw) {
  const digits = String(raw || "").replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 7)
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
}

/**
 * +998 prefiksi bilan Uzbekiston telefon raqami inputi.
 * value: faqat raqamlar (9 ta), onChange(digits: string) qaytaradi.
 */
export default function PhoneInput({ value, onChange, disabled, placeholder }) {
  function handleChange(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
    onChange?.(digits);
  }

  return (
    <div
      className={`flex overflow-hidden rounded-lg border border-[#1e3448] transition-colors ${
        disabled
          ? "opacity-60"
          : "focus-within:border-[#69a7ff]/60 focus-within:ring-1 focus-within:ring-[#69a7ff]/20"
      }`}
    >
      <span className="flex shrink-0 select-none items-center border-r border-[#1e3448] bg-[#07111d] px-3 text-sm font-semibold text-[#9ab8cc]">
        +998
      </span>
      <input
        type="tel"
        value={formatDisplay(value)}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder ?? "90 123 45 67"}
        className="h-10 flex-1 bg-[#0d1e2e] px-3 text-base md:text-sm text-white placeholder-[#456070] outline-none disabled:cursor-not-allowed"
      />
    </div>
  );
}
