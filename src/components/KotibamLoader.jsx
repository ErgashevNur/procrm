import { cn } from "@/lib/utils";

export default function KotibamLoader({
  fullScreen = false,
  minHeight = "320px",
  compact = false,
  className = "",
}) {
  if (compact) {
    return (
      <div
        className={cn(
          "relative isolate flex w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#071828] px-4 py-7",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(105,167,255,0.14),transparent_65%)]" />
        <p className="kotibam-loader-word kotibam-loader-word--compact">Kotibam</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative isolate flex w-full items-center justify-center overflow-hidden rounded-[28px] border border-white/8 bg-[#071828]",
        fullScreen ? "min-h-screen rounded-none border-0" : "",
        className,
      )}
      style={!fullScreen ? { minHeight } : undefined}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(105,167,255,0.18),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:36px_36px]" />

      <p className="kotibam-loader-word relative text-center">Kotibam</p>
    </div>
  );
}
