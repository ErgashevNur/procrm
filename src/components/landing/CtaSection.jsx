import { cn } from "@/lib/utils";

export default function CtaSection({
  isMobile,
  isCompact,
  isNarrow,
  pagePadding,
}) {
  const sectionPaddingClass =
    pagePadding === "1rem" ? "px-4 pb-[3.5rem]" : pagePadding === "4.5%" ? "px-[4.5%] pb-20" : "px-[6%] pb-20";

  return (
    <section className={`${sectionPaddingClass} mt-16`}>
      <div
        className={cn(
          "relative overflow-hidden border border-sky-500/14 bg-[linear-gradient(135deg,#0c1a30_0%,#0a1220_55%,#0d1a20_100%)] text-center",
          isNarrow ? "rounded-[14px] px-[0.9rem] py-[1.4rem]" : isMobile ? "rounded-2xl px-4 py-7" : isCompact ? "rounded-3xl px-8 py-[2.6rem]" : "rounded-3xl px-12 py-16",
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,.07),transparent_60%)]" />
        <h2 className="relative mt-2 mb-3 text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold tracking-[-0.02em] text-white">
          {isMobile ? "Bugun boshlang bepul" : "Bugun boshlang — bepul"}
        </h2>

        <button className="relative rounded-[10px] bg-[#0ea5e9] px-[2.2rem] py-[0.85rem] text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#38bdf8]">
          Bepul ro'yxatdan o'tish →
        </button>
      </div>
    </section>
  );
}
