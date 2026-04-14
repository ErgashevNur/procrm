export default function CtaSection({ isMobile, pagePadding }) {
  return (
    <section
      style={{
        padding: isMobile ? "2rem 1rem 3.5rem" : `2rem ${pagePadding} 5rem`,
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg,#0c1a30 0%,#0a1220 55%,#0d1a20 100%)",
          border: "1px solid rgba(14,165,233,.14)",
          borderRadius: 24,
          padding: isMobile ? "2.2rem 1.2rem" : "4rem 3rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 50%,rgba(14,165,233,.07),transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <h2
          style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.02em",
            marginBottom: 12,
            position: "relative",
          }}
        >
          Bugun boshlang — bepul
        </h2>

        <button
          className="btn-s"
          style={{
            background: "#0ea5e9",
            border: "none",
            color: "#fff",
            padding: "0.85rem 2.2rem",
            fontSize: 15,
            borderRadius: 10,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            cursor: "pointer",
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>Bepul ro'yxatdan o'tish</span>
          <span
            aria-hidden="true"
            style={{ display: isMobile ? "none" : "inline-flex" }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </section>
  );
}
