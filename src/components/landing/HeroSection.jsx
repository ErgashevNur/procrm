import { cn } from "@/lib/utils";

export default function HeroSection({
  isMobile,
  isCompact,
  isNarrow,
  pagePadding,
  navigate,
}) {
  const sectionPaddingClass =
    pagePadding === "1rem" ? "px-4 pt-[4.5rem] pb-[3.5rem]" : pagePadding === "4.5%" ? "px-[4.5%] pt-[7rem] pb-[5rem]" : "px-[6%] pt-[7rem] pb-[5rem]";
  const statsMarginTopClass = isNarrow ? "mt-[2.4rem]" : isMobile ? "mt-12" : "mt-[4.5rem]";
  const statsRadiusClass = isNarrow ? "rounded-[10px]" : isMobile ? "rounded-xl" : "rounded-2xl";

  return (
    <section className={cn("relative overflow-hidden text-center", sectionPaddingClass)}>
      <div className={cn("pointer-events-none absolute left-1/2 top-[-120px] -translate-x-1/2 rounded-full bg-[rgba(14,165,233,.08)] blur-[80px]", isMobile ? "h-[380px] w-[380px]" : "h-[700px] w-[700px]")} />
      <div className={cn("pointer-events-none absolute left-[5%] top-[180px] rounded-full bg-[rgba(99,102,241,.06)] blur-[60px]", isMobile ? "h-[180px] w-[180px]" : "h-[300px] w-[300px]")} />
      <div className={cn("pointer-events-none absolute top-[150px] right-[5%] rounded-full bg-[rgba(16,185,129,.05)] blur-[55px]", isMobile ? "h-[160px] w-[160px]" : "h-[260px] w-[260px]")} />

      <div className="mb-[1.8rem] inline-flex animate-[fadeUp_.7s_ease_both] items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-[5px] [animation-delay:.1s]">
        <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
        <span className="text-[11px] font-semibold tracking-[0.14em] text-sky-400/90 uppercase">
          O'zbekistondagi №1 AI kotib
        </span>
      </div>

      <h1 className="mb-[1.4rem] animate-[fadeUp_.7s_ease_both] text-[clamp(2.6rem,6vw,5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white [animation-delay:.2s]">
        Biznesingizning
        <br />
        <span className="text-[#0ea5e9]">aqlli kotibi</span>
      </h1>

      <p className={cn("mx-auto mb-[2.8rem] max-w-[580px] animate-[fadeUp_.7s_ease_both] font-light text-white/44 [animation-delay:.25s]", isMobile ? "text-[0.96rem] leading-[1.7]" : "text-[1.05rem] leading-[1.78]")}>
        Kotibam — savdo jamoalari uchun yaratilgan  CRM platforma.
        <br />
        Leadlar, vazifalar, tahlil va AI kotib — hammasi bitta tizimda.
      </p>

      <div className="flex animate-[fadeUp_.7s_ease_both] flex-wrap justify-center gap-[0.9rem] [animation-delay:.35s]">
        <button
          className="rounded-[10px] bg-[#0ea5e9] px-8 py-[0.85rem] text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#38bdf8]"
          onClick={() => navigate("/register")}
        >
          Bepul boshlash →
        </button>
      </div>

      <div
        className={cn(
          "mx-auto grid w-full max-w-[680px] animate-[fadeUp_.7s_ease_both] overflow-hidden border border-white/7 [animation-delay:.45s]",
          isMobile ? "grid-cols-2" : "grid-cols-4",
          statsMarginTopClass,
          statsRadiusClass,
        )}
      >
        {[["500+", "Faol kompaniya"], ["98%", "Mijoz mamnuniyati"], ["3x", "Savdo o'sishi"], ["24/7", "AI ishlaydi"]].map(
          ([num, label]) => (
            <div
              key={label}
              className={cn(
                "bg-[#0d1220] text-center",
                isMobile ? "min-w-0" : "min-w-[120px]",
                isNarrow ? "px-2 py-[0.8rem]" : isMobile ? "px-[0.65rem] py-[0.95rem]" : isCompact ? "px-[0.8rem] py-[1.15rem]" : "px-4 py-6",
                !isMobile && label !== "AI ishlaydi" && "border-r border-white/7",
                isMobile && (label === "Faol kompaniya" || label === "Mijoz mamnuniyati") && "border-b border-white/7",
              )}
            >
              <div className={cn("font-extrabold tracking-[-0.02em] text-[#0ea5e9]", isNarrow ? "text-xl" : isMobile ? "text-[1.45rem]" : isCompact ? "text-[1.65rem]" : "text-[1.9rem]")}>
                {num}
              </div>
              <div className={cn("mt-1 text-white/32", isNarrow ? "text-[9px]" : isMobile ? "text-[10px]" : "text-[11px]")}>{label}</div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
