import { cn } from "@/lib/utils";

export default function HowItWorksSection({
  isMobile,
  isTablet,
  isCompact,
  isNarrow,
  isSingleColumn,
  pagePadding,
  steps,
}) {
  const sectionPaddingClass =
    pagePadding === "1rem" ? "px-4 py-[3.5rem]" : pagePadding === "4.5%" ? "px-[4.5%] py-20" : "px-[6%] py-20";

  return (
    <section id="how" className={sectionPaddingClass}>
      <div className="mb-14 text-center">
        <div className="mb-3 text-[10px] font-bold tracking-[0.2em] text-sky-400/80 uppercase">Qanday ishlaydi</div>
        <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold tracking-[-0.02em] text-white">4 qadamda tayyor</h2>
      </div>

      <div
        className={cn(
          "mx-auto grid w-full max-w-[900px] justify-items-center",
          isSingleColumn ? "grid-cols-1" : isMobile || isTablet ? "grid-cols-2" : "grid-cols-4",
          isNarrow ? "gap-[0.85rem]" : isMobile ? "gap-4" : isCompact ? "gap-[1.1rem]" : "gap-6",
        )}
      >
        {steps.map((s) => (
          <div key={s.num} className={cn("w-full", isMobile ? "max-w-full text-center" : "max-w-[210px] text-left")}>
            <div className={cn("mb-3 font-extrabold leading-none tracking-[-0.04em] text-sky-500/12", isNarrow ? "text-[2rem]" : isMobile ? "text-[2.35rem]" : isCompact ? "text-[2.7rem]" : "text-[3.2rem]")}>
              {s.num}
            </div>
            <div className={cn("mb-[0.9rem] h-0.5 w-[30px] rounded-sm bg-[#0ea5e9]", isMobile && "mx-auto")} />
            <div className={cn("mb-2 font-semibold text-white", isNarrow ? "text-[13px]" : isMobile ? "text-sm" : "text-[15px]")}>{s.title}</div>
            <p className={cn("font-light text-white/36", isNarrow ? "text-[11px] leading-[1.65]" : isMobile ? "text-xs leading-[1.65]" : "text-[13px] leading-[1.65]")}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
