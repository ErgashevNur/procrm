import { cn } from "@/lib/utils";

const accentClassMap = {
  "#0ea5e9": "border-sky-500/25 bg-sky-500/13 text-sky-500",
  "#8b5cf6": "border-violet-500/25 bg-violet-500/13 text-violet-500",
  "#10b981": "border-emerald-500/25 bg-emerald-500/13 text-emerald-500",
};

export default function TestimonialsSection({
  isMobile,
  isCompact,
  isNarrow,
  isSingleColumn,
  pagePadding,
  testimonials,
}) {
  const sectionPaddingClass =
    pagePadding === "1rem" ? "px-4 py-[3.5rem]" : pagePadding === "4.5%" ? "px-[4.5%] py-20" : "px-[6%] py-20";

  return (
    <section id="testimonials" className={cn("bg-[#080d17]", sectionPaddingClass)}>
      <div className="mb-12 text-center">
        <div className="mb-3 text-[10px] font-bold tracking-[0.2em] text-sky-400/80 uppercase">Mijozlar fikri</div>
        <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold tracking-[-0.02em] text-white">Ular allaqachon o'sdi</h2>
      </div>

      <div
        className={cn(
          "mx-auto grid w-full max-w-[1120px] items-stretch",
          isSingleColumn ? "grid-cols-1" : isMobile ? "grid-cols-2" : "grid-cols-[repeat(auto-fit,minmax(240px,1fr))]",
          isNarrow ? "gap-3" : isMobile ? "gap-[0.9rem]" : "gap-[1.2rem]",
        )}
      >
        {testimonials.map((t) => (
          <div
            key={t.name}
            className={cn(
              "mx-auto w-full border border-white/7 bg-[#0b1018] transition-[border-color] duration-[250ms] hover:border-[rgba(14,165,233,.22)]",
              isNarrow ? "rounded-xl p-4" : isMobile ? "rounded-[14px] p-[1.15rem]" : isCompact ? "rounded-[18px] p-[1.35rem]" : "rounded-[18px] p-[1.8rem]",
            )}
          >
            <div className={cn("mb-4 tracking-[2px] text-amber-500", isNarrow ? "text-[11px]" : isMobile ? "text-xs" : "text-[13px]")}>★★★★★</div>
            <p className={cn("mb-[1.3rem] font-light italic text-white/43", isNarrow ? "text-[11px] leading-[1.58]" : isMobile ? "text-xs leading-[1.68]" : "text-[13px] leading-[1.77]")}>
              "{t.text}"
            </p>
            <div className="flex items-center gap-[10px]">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full border font-bold",
                  accentClassMap[t.color],
                  isNarrow ? "h-[30px] w-[30px] text-[10px]" : isMobile ? "h-[34px] w-[34px] text-[11px]" : "h-[38px] w-[38px] text-xs",
                )}
              >
                {t.initials}
              </div>
              <div>
                <div className={cn("font-semibold text-white", isNarrow ? "text-[11px]" : isMobile ? "text-xs" : "text-[13px]")}>{t.name}</div>
                <div className={cn("text-white/30", isNarrow ? "text-[9px]" : isMobile ? "text-[10px]" : "text-[11px]")}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
