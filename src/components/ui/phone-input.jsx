import { cn } from "@/lib/utils";

export function extractLocalDigits(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  const local = digits.startsWith("998") ? digits.slice(3) : digits;
  return local.slice(0, 9);
}

export function formatLocalDisplay(localDigits) {
  if (!localDigits) return "";
  const p1 = localDigits.slice(0, 2);
  const p2 = localDigits.slice(2, 5);
  const p3 = localDigits.slice(5, 7);
  const p4 = localDigits.slice(7, 9);
  let out = p1;
  if (p2) out += ` ${p2}`;
  if (p3) out += ` ${p3}`;
  if (p4) out += ` ${p4}`;
  return out;
}

export function normalizePhone(raw) {
  const local = extractLocalDigits(raw);
  if (!local) return "";
  return `+998${local}`;
}

export function isValidUzPhone(value) {
  return extractLocalDigits(value).length === 9;
}

export function PhoneInput({ value, onChange, error, className, id, ...props }) {
  const localDigits = extractLocalDigits(value);
  const displayValue = formatLocalDisplay(localDigits);

  function handleChange(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 9);
    onChange?.(raw ? `+998${raw}` : "");
  }

  return (
    <div
      className={cn(
        "flex h-11 items-center overflow-hidden rounded-xl border transition-colors",
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)),rgba(7,16,27,0.72)]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-[18px]",
        "focus-within:border-sky-500/50",
        error ? "border-rose-500/50 bg-rose-500/10" : "border-white/10",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-full select-none items-center border-r border-white/12 px-3 text-sm font-semibold text-slate-300 shrink-0"
      >
        +998
      </span>

      <input
        type="tel"
        inputMode="numeric"
        autoComplete="off"
        {...props}
        id={id}
        value={displayValue}
        onChange={handleChange}
        placeholder="90 123 45 67"
        maxLength={12}
        className="h-full flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-600"
      />
    </div>
  );
}
