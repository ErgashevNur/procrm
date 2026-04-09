import { cn } from "@/lib/utils";

export default function LandingNav({
  scrolled,
  isMobile,
  pagePadding,
  navigate,
}) {
  const navPaddingClass =
    pagePadding === "1rem" ? "px-4 py-[0.9rem]" : pagePadding === "4.5%" ? "px-[4.5%] py-4" : "px-[6%] py-4";

  return (
    <nav
      className={cn(
        "sticky top-0 z-[99] flex flex-nowrap items-center justify-between gap-4 border-b backdrop-blur-[20px] transition-all duration-300",
        isMobile ? "gap-[10px]" : "gap-4",
        navPaddingClass,
        scrolled
          ? "border-white/7 bg-[rgba(7,11,18,.96)]"
          : "border-transparent bg-[rgba(7,11,18,.5)]",
      )}
    >
      <div className={cn("flex min-w-0 shrink items-center", isMobile ? "gap-2" : "gap-[10px]")}>
        <div
          className={cn(
            "shrink-0 overflow-hidden rounded-[9px] border border-white/82 bg-[radial-gradient(circle_at_50%_42%,_rgba(255,255,255,.44),_rgba(255,255,255,.2)_28%,_rgba(255,255,255,.08)_48%,_rgba(14,165,233,.18)_72%,_rgba(14,165,233,.1)_100%)] shadow-[inset_0_0_10px_rgba(255,255,255,.4),inset_0_0_22px_rgba(255,255,255,.22),inset_0_0_42px_rgba(255,255,255,.12),0_0_18px_rgba(255,255,255,.12)]",
            isMobile ? "h-8 w-8" : "h-[34px] w-[34px]",
          )}
        >
          <div className="flex h-full w-full items-center justify-center">
            <img
              src="/logo.png"
              alt="Kotibam"
              className={cn("object-contain", isMobile ? "h-[18px] w-[18px]" : "h-[19px] w-[19px]")}
            />
          </div>
        </div>
        <span className={cn("whitespace-nowrap font-bold tracking-[-0.01em] text-white", isMobile ? "text-sm" : "text-[15px]")}>
          Kotibam
        </span>
      </div>

      <div className={cn("flex w-auto shrink-0", isMobile ? "gap-2" : "gap-[10px]")}>
        <button
          className={cn(
            "rounded-lg border border-white/12 bg-transparent font-medium whitespace-nowrap text-white/65 transition-[border-color,color] duration-200 hover:border-white/28 hover:text-white",
            isMobile ? "px-3 py-[7px] text-xs" : "px-[18px] py-[7px] text-[13px]",
          )}
          onClick={() => navigate("/login")}
        >
          Kirish
        </button>
        <button
          className={cn(
            "rounded-lg bg-[#0ea5e9] font-semibold whitespace-nowrap text-white transition-colors duration-200 hover:bg-[#38bdf8]",
            isMobile ? "px-3 py-[7px] text-xs" : "px-[18px] py-[7px] text-[13px]",
          )}
          onClick={() => navigate("/register")}
        >
          Ro'yxatdan o'tish
        </button>
      </div>
    </nav>
  );
}
