export default function LoginBrand({ className = "" }) {
  return (
    <div className={className}>
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(255,255,255,.44), rgba(255,255,255,.2) 28%, rgba(255,255,255,.08) 48%, rgba(14,165,233,.18) 72%, rgba(14,165,233,.1) 100%)",
          border: "1px solid rgba(255,255,255,.82)",
          boxShadow:
            "inset 0 0 10px rgba(255,255,255,.4), inset 0 0 22px rgba(255,255,255,.22), inset 0 0 42px rgba(255,255,255,.12), 0 0 18px rgba(255,255,255,.12)",
        }}
      >
        <img src="/logo.png" alt="Kotibam" className="h-5 w-5" />
      </div>
      <span className="text-[11px] font-semibold tracking-[0.26em] text-white/60 uppercase">
        Kotibam
      </span>
    </div>
  );
}
