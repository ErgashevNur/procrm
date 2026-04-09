import { cn } from "@/lib/utils";

export default function LandingFooter({
  isMobile,
  pagePadding,
}) {
  const footerPaddingClass =
    pagePadding === "1rem" ? "px-4 pt-[1.2rem] pb-8" : pagePadding === "4.5%" ? "px-[4.5%] py-8" : "px-[6%] py-8";

  return (
    <footer
      className={cn(
        "mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-4 border-t border-white/6",
        footerPaddingClass,
        isMobile ? "justify-center text-center" : "justify-between text-left",
      )}
    >
      <div className="flex items-center gap-[10px]">
        <div className="flex h-[30px] w-[30px] items-center justify-center overflow-hidden rounded-[8px] border border-white/82 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,.44),rgba(255,255,255,.2)_28%,rgba(255,255,255,.08)_48%,rgba(14,165,233,.18)_72%,rgba(14,165,233,.1)_100%)] shadow-[inset_0_0_10px_rgba(255,255,255,.4),inset_0_0_22px_rgba(255,255,255,.22),inset_0_0_42px_rgba(255,255,255,.12),0_0_18px_rgba(255,255,255,.12)]">
          <img
            src="/logo.png"
            alt="Kotibam"
            className="h-4 w-4 object-contain"
          />
        </div>
        <span className="text-sm font-bold text-white">Kotibam</span>
      </div>

      <div className="text-xs text-white/18">© 2026 Kotibam. Barcha huquqlar himoyalangan.</div>
    </footer>
  );
}
