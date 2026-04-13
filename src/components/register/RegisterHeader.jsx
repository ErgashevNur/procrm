import RegisterBackButton from "@/components/register/RegisterBackButton";

export default function RegisterHeader({ isMobile, navigate }) {
  return (
    <div
      style={{
        marginBottom: 24,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div>
        <p
          style={{
            marginBottom: 12,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.28em",
            color: "rgba(56,189,248,.8)",
            textTransform: "uppercase",
          }}
        >
          Ro'yxatdan o'tish
        </p>
        <h1
          style={{
            fontSize: isMobile ? 24 : 26,
            lineHeight: 1.15,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#fff",
          }}
        >
          Hisobingizni yarating
        </h1>
        <p
          style={{
            marginTop: 12,
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(255,255,255,.38)",
          }}
        >
          Kerakli ma'lumotlarni kiriting va kompaniyangizni ulang.
        </p>
      </div>
      <RegisterBackButton
        onClick={() => navigate("/")}
        className="hidden xl:inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs leading-none font-medium text-white/70 transition-colors hover:border-white/15 hover:text-white sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs"
      />
    </div>
  );
}
