import { cn } from "@/lib/utils";

/**
 * EmailInput — @gmail.com avtomatik qo'shiladigan email input
 *
 * - Foydalanuvchi faqat username qismini yozadi: `john.doe`
 * - `@gmail.com` suffix sifatida ko'rinadi (kulrang)
 * - Blur bo'lganda "@" yo'q bo'lsa, `@gmail.com` avtomatik qo'shiladi
 * - Agar foydalanuvchi o'zi "@" yozsa, istalgan domain ishlatishi mumkin
 *
 * onChange(value) → to'liq email stringini qaytaradi
 */
export function EmailInput({
  value = "",
  onChange,
  onBlur,
  error,
  className,
  placeholder = "username",
  id,
  ...props
}) {
  const hasAt = String(value).includes("@");
  const showSuffix = !hasAt && value.length > 0;

  function handleChange(e) {
    onChange?.(e.target.value);
  }

  function handleBlur(e) {
    const val = e.target.value.trim();
    if (val && !val.includes("@")) {
      onChange?.(`${val}@gmail.com`);
    }
    onBlur?.(e);
  }

  return (
    <div className={cn("relative", className)}>
      <input
        {...props}
        id={id}
        type={hasAt ? "email" : "text"}
        autoComplete="email"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          "crm-control h-11 w-full rounded-xl border px-4 text-sm text-white",
          "transition-colors placeholder:text-slate-600",
          "focus-visible:outline-none focus-visible:ring-0",
          showSuffix ? "pr-[112px]" : "pr-4",
          error
            ? "border-rose-500/50 bg-rose-500/[0.06] focus-visible:border-rose-500/60"
            : "border-white/10 focus-visible:border-sky-500/50",
        )}
      />

      {/* @gmail.com suffix — faqat @ yo'q va biror narsa yozilganda ko'rinadi */}
      {showSuffix && (
        <div
          className="pointer-events-none absolute top-0 right-0 flex h-full items-center pr-4"
          aria-hidden="true"
        >
          <span className="text-sm text-slate-500 select-none">@gmail.com</span>
        </div>
      )}
    </div>
  );
}
