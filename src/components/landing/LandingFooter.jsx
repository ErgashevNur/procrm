export default function LandingFooter({ isMobile, pagePadding }) {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,.06)",
        padding: isMobile ? "1.2rem 1rem 2rem" : `2rem ${pagePadding}`,
        display: "flex",
        alignItems: "center",
        justifyContent: isMobile ? "center" : "space-between",
        flexWrap: "wrap",
        gap: "1rem",
        textAlign: isMobile ? "center" : "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background:
              "radial-gradient(circle at 50% 42%, rgba(255,255,255,.44), rgba(255,255,255,.2) 28%, rgba(255,255,255,.08) 48%, rgba(14,165,233,.18) 72%, rgba(14,165,233,.1) 100%)",
            border: "1px solid rgba(255,255,255,.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow:
              "inset 0 0 10px rgba(255,255,255,.4), inset 0 0 22px rgba(255,255,255,.22), inset 0 0 42px rgba(255,255,255,.12), 0 0 18px rgba(255,255,255,.12)",
          }}
        >
          <img
            src="/logo.png"
            alt="Kotibam"
            style={{ width: 16, height: 16, objectFit: "contain" }}
          />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
          Kotibam
        </span>
      </div>

      <div style={{ fontSize: 12, color: "rgba(255,255,255,.18)" }}>
        © 2026 Kotibam. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  );
}
