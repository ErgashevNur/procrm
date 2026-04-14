export default function LandingNav({
  isMobile,
  pagePadding,
  scrolled,
  navigate,
}) {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "nowrap",
        gap: isMobile ? 10 : 16,
        padding: isMobile ? "0.9rem 1rem" : `1rem ${pagePadding}`,
        position: "sticky",
        top: 0,
        zIndex: 99,
        background: scrolled ? "rgba(7,11,18,.96)" : "rgba(7,11,18,.5)",
        borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,.07)" : "transparent"}`,
        backdropFilter: "blur(20px)",
        transition: "all .3s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 8 : 10,
          minWidth: 0,
          flexShrink: 1,
        }}
      >
        <div
          style={{
            width: isMobile ? 32 : 34,
            height: isMobile ? 32 : 34,
            borderRadius: 9,
            background:
              "radial-gradient(circle at 50% 42%, rgba(255,255,255,.44), rgba(255,255,255,.2) 28%, rgba(255,255,255,.08) 48%, rgba(14,165,233,.18) 72%, rgba(14,165,233,.1) 100%)",
            border: "1px solid rgba(255,255,255,.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
            boxShadow:
              "inset 0 0 10px rgba(255,255,255,.4), inset 0 0 22px rgba(255,255,255,.22), inset 0 0 42px rgba(255,255,255,.12), 0 0 18px rgba(255,255,255,.12)",
          }}
        >
          <img
            src="/logo.png"
            alt="Kotibam"
            style={{
              width: isMobile ? 18 : 19,
              height: isMobile ? 18 : 19,
              objectFit: "contain",
            }}
          />
        </div>
        <span
          style={{
            fontSize: isMobile ? 14 : 15,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          Kotibam
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: isMobile ? 8 : 10,
          width: "auto",
          flexShrink: 0,
        }}
      >
        <button
          className="btn-g"
          onClick={() => navigate("/login")}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,.12)",
            color: "rgba(255,255,255,.65)",
            padding: isMobile ? "7px 12px" : "7px 18px",
            borderRadius: 8,
            fontFamily: "Inter, sans-serif",
            fontSize: isMobile ? 12 : 13,
            fontWeight: 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Kirish
        </button>
        <button
          className="btn-s"
          onClick={() => navigate("/register")}
          style={{
            background: "#0ea5e9",
            border: "none",
            color: "#fff",
            padding: isMobile ? "7px 12px" : "7px 18px",
            borderRadius: 8,
            fontFamily: "Inter, sans-serif",
            fontSize: isMobile ? 12 : 13,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Ro'yxatdan o'tish
        </button>
      </div>
    </nav>
  );
}
