import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SUFFIX = "@gmail.com";
const SLIDE_DURATION_MS = 380;
const IMPACT_BUMP_MS = 360;
const IMPACT_STAGGER_MS = 14;

/**
 * EmailInput — @gmail.com avtomatik qo'shiladigan email input
 *
 * - Foydalanuvchi faqat username qismini yozadi: `john.doe`
 * - `@gmail.com` o'ngda kulrang ghost text bo'lib turadi
 * - Blur bo'lganda "@" yo'q bo'lsa, suffix o'ngdan-chapga sirpanib username matnining ohiriga aniq yopishadi
 * - Yopishgan paytda harflar bir-biriga turtiladi va keyin joylariga qaytadi (impact bump)
 *
 * onChange(value) → to'liq email stringini qaytaradi
 * onBlur(event, finalValue) → animatsiya tugagach yakuniy qiymat bilan chaqiriladi
 */
export function EmailInput({
  value = "",
  onChange,
  onBlur,
  onFocus,
  error,
  className,
  placeholder = "username",
  id,
  ...props
}) {
  const inputRef = useRef(null);
  const suffixRef = useRef(null);
  const measureRef = useRef(null);
  const lettersRef = useRef(null);
  const animTimeoutRef = useRef(null);
  const [slideOffset, setSlideOffset] = useState(0);
  const [phase, setPhase] = useState("idle"); // 'idle' | 'sliding' | 'impact'
  const [impactValue, setImpactValue] = useState("");

  const cancelAnim = () => {
    if (animTimeoutRef.current) {
      clearTimeout(animTimeoutRef.current);
      animTimeoutRef.current = null;
    }
    setPhase("idle");
    setSlideOffset(0);
    setImpactValue("");
  };

  useEffect(() => () => cancelAnim(), []);

  // Impact phase: harflarning bir-biriga turtilish animatsiyasi
  useEffect(() => {
    if (phase !== "impact") return;
    const el = lettersRef.current;
    if (!el) return;

    const letters = Array.from(el.children);
    const totalDuration =
      IMPACT_BUMP_MS + Math.max(0, letters.length - 1) * IMPACT_STAGGER_MS;

    letters.forEach((node, i) => {
      node.animate(
        [
          { transform: "translateX(0) scaleX(1)" },
          {
            transform: "translateX(-3px) scaleX(0.82)",
            offset: 0.35,
          },
          {
            transform: "translateX(2px) scaleX(1.08)",
            offset: 0.68,
          },
          { transform: "translateX(0) scaleX(1)" },
        ],
        {
          duration: IMPACT_BUMP_MS,
          delay: i * IMPACT_STAGGER_MS,
          easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          fill: "both",
        },
      );
    });

    animTimeoutRef.current = setTimeout(() => {
      setPhase("idle");
      setImpactValue("");
      animTimeoutRef.current = null;
    }, totalDuration + 30);
  }, [phase]);

  const hasAt = String(value).includes("@");
  const showSuffix = !hasAt && value.length > 0 && phase !== "impact";
  const sliding = phase === "sliding";
  const impact = phase === "impact";

  function handleChange(e) {
    if (phase !== "idle") cancelAnim();
    onChange?.(e.target.value);
  }

  function handleFocus(e) {
    cancelAnim();
    onFocus?.(e);
  }

  function handleBlur(e) {
    const trimmed = e.target.value.trim();

    if (trimmed && !trimmed.includes("@")) {
      const input = inputRef.current;
      const measure = measureRef.current;
      const suffixEl = suffixRef.current;

      if (!input || !measure || !suffixEl) {
        const finalValue = trimmed + SUFFIX;
        onChange?.(finalValue);
        onBlur?.(e, finalValue);
        return;
      }

      measure.textContent = trimmed;
      const usernameWidth = measure.getBoundingClientRect().width;

      const inputRect = input.getBoundingClientRect();
      const suffixRect = suffixEl.getBoundingClientRect();
      const styles = window.getComputedStyle(input);
      const paddingLeft = parseFloat(styles.paddingLeft) || 0;

      const currentLeft = suffixRect.left - inputRect.left;
      const targetLeft = paddingLeft + usernameWidth;
      const offset = targetLeft - currentLeft;

      setPhase("sliding");
      requestAnimationFrame(() => {
        setSlideOffset(offset);
      });

      const finalValue = trimmed + SUFFIX;
      animTimeoutRef.current = setTimeout(() => {
        onChange?.(finalValue);
        setSlideOffset(0);
        setImpactValue(finalValue);
        setPhase("impact");
        onBlur?.(e, finalValue);
      }, SLIDE_DURATION_MS);
      return;
    }

    onBlur?.(e, trimmed || value);
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <input
        {...props}
        ref={inputRef}
        id={id}
        type={hasAt ? "email" : "text"}
        autoComplete="email"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          "crm-control h-11 w-full rounded-xl border px-4 text-sm text-white",
          "transition-colors placeholder:text-slate-600",
          "focus-visible:outline-none focus-visible:ring-0",
          showSuffix ? "pr-28" : "pr-4",
          impact && "text-transparent",
          error
            ? "border-rose-500/50 bg-rose-500/6 focus-visible:border-rose-500/60"
            : "border-white/10 focus-visible:border-sky-500/50",
        )}
      />

      {/* Hidden measuring span */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute top-0 left-0 text-sm"
        style={{ visibility: "hidden", whiteSpace: "pre" }}
      />

      {showSuffix && (
        <div
          ref={suffixRef}
          className="pointer-events-none absolute top-0 right-0 flex h-full items-center pr-4"
          aria-hidden="true"
          style={{
            transform: `translateX(${slideOffset}px)`,
            transition: sliding
              ? `transform ${SLIDE_DURATION_MS}ms cubic-bezier(0.4, 0.1, 0.4, 1), color ${SLIDE_DURATION_MS}ms linear`
              : "none",
          }}
        >
          <span
            className={cn(
              "text-sm select-none transition-colors",
              sliding ? "text-white" : "text-slate-500",
            )}
            style={{ transitionDuration: `${SLIDE_DURATION_MS}ms` }}
          >
            {SUFFIX}
          </span>
        </div>
      )}

      {impact && (
        <div
          ref={lettersRef}
          className="pointer-events-none absolute top-0 left-0 flex h-full items-center pl-4 text-sm text-white"
          aria-hidden="true"
          style={{ whiteSpace: "pre" }}
        >
          {Array.from(impactValue).map((char, i) => (
            <span
              key={`${i}-${char}`}
              style={{ display: "inline-block", willChange: "transform" }}
            >
              {char === " " ? " " : char}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
