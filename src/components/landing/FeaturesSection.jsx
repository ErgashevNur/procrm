import { cn } from "@/lib/utils";

export default function FeaturesSection({
  isMobile,
  isTablet,
  isCompact,
  isNarrow,
  isSingleColumn,
  pagePadding,
  features,
}) {
  const sectionPaddingClass =
    pagePadding === "1rem" ? "px-4 py-[3.5rem]" : pagePadding === "4.5%" ? "px-[4.5%] py-20" : "px-[6%] py-20";

  return (
    <section id="features" className={cn("bg-[#080d17]", sectionPaddingClass)}>
      <div className="mb-14 text-center">
        <div className="mb-3 text-[10px] font-bold tracking-[0.2em] text-sky-400/80 uppercase">Imkoniyatlar</div>
        <h2 className="mb-3 text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold tracking-[-0.02em] text-white">
          Biznesingiz uchun hamma narsa
        </h2>
        <p className="mx-auto max-w-[500px] text-[15px] font-light text-white/38">
          Bir platformada — AI kotib, pipeline, tahlil va jamoa boshqaruvi.
        </p>
      </div>

      <div
        className={cn(
          "mx-auto grid w-full max-w-[1120px] gap-px overflow-hidden rounded-[20px] border border-white/6 bg-white/6",
          isSingleColumn ? "grid-cols-1" : isMobile || isTablet ? "grid-cols-2" : "grid-cols-3",
          isNarrow ? "rounded-xl" : isMobile ? "rounded-[14px]" : "rounded-[20px]",
        )}
      >
        {features.map((f) => (
          <div
            key={f.title}
            className={cn(
              "border border-transparent bg-[#0b1018] transition-[background,border-color] duration-[250ms] hover:border-[rgba(14,165,233,.25)] hover:bg-[#141d2e]",
              isNarrow ? "p-[0.85rem]" : isMobile ? "p-4" : isCompact ? "p-[1.35rem]" : "p-[2.2rem]",
            )}
          >
            <div
              className={cn(
                "mb-[1.2rem] flex items-center justify-center border border-sky-500/15 bg-sky-500/10 text-sky-400",
                isNarrow ? "mb-3 h-[34px] w-[34px] rounded-[9px]" : isMobile ? "mb-[0.9rem] h-[38px] w-[38px] rounded-[10px]" : "h-11 w-11 rounded-[11px]",
              )}
            >
              {f.icon}
            </div>
            <div className={cn("mb-2 font-semibold text-white", isNarrow ? "text-[13px]" : isMobile ? "text-sm" : "text-[15px]")}>{f.title}</div>
            <p className={cn("font-light text-white/36", isNarrow ? "text-[11px] leading-[1.55]" : isMobile ? "text-xs leading-[1.62]" : "text-[13px] leading-[1.72]")}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
