const stats = [
  ["500+", "Faol kompaniya"],
  ["98%", "Mijoz mamnuniyati"],
  ["3x", "Savdo o'sishi"],
  ["24/7", "AI ishlaydi"],
];

export default function HeroSection({ isMobile, pagePadding, navigate }) {
  return (
    <section
      style={{
        padding: isMobile ? "4.5rem 1rem 3.5rem" : `7rem ${pagePadding} 5rem`,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -120,
          left: "50%",
          transform: "translateX(-50%)",
          width: isMobile ? 380 : 700,
          height: isMobile ? 380 : 700,
          borderRadius: "50%",
          background: "rgba(14,165,233,.08)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 180,
          left: "5%",
          width: isMobile ? 180 : 300,
          height: isMobile ? 180 : 300,
          borderRadius: "50%",
          background: "rgba(99,102,241,.06)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 150,
          right: "5%",
          width: isMobile ? 160 : 260,
          height: isMobile ? 160 : 260,
          borderRadius: "50%",
          background: "rgba(16,185,129,.05)",
          filter: "blur(55px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="fu d1"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(14,165,233,.1)",
          border: "1px solid rgba(14,165,233,.2)",
          borderRadius: 100,
          padding: "5px 16px",
          marginBottom: "1.8rem",
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#38bdf8",
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            color: "rgba(56,189,248,.9)",
            textTransform: "uppercase",
          }}
        >
          O'zbekistondagi №1 AI CRM
        </span>
      </div>

      <h1
        className="fu d2"
        style={{
          fontSize: "clamp(2.6rem, 6vw, 5rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          marginBottom: "1.4rem",
          color: "#fff",
        }}
      >
        Biznesingizning
        <br />
        <span style={{ color: "#0ea5e9" }}>aqlli kotibi</span>
      </h1>

      <p
        className="fu d3"
        style={{
          maxWidth: 580,
          margin: "0 auto 2.8rem",
          fontSize: isMobile ? "0.96rem" : "1.05rem",
          lineHeight: isMobile ? 1.7 : 1.78,
          color: "rgba(255,255,255,.44)",
          fontWeight: 300,
        }}
      >
        Kotibam — savdo jamoalari uchun yaratilgan CRM platforma.
        <br />
        Leadlar, vazifalar, tahlil va AI kotib — hammasi bitta tizimda.
      </p>

      <div
        className="fu d4"
        style={{
          display: "flex",
          gap: "0.9rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          className="btn-s"
          onClick={() => navigate("/register")}
          style={{
            background: "#0ea5e9",
            border: "none",
            color: "#fff",
            padding: "0.85rem 2rem",
            fontSize: 15,
            borderRadius: 10,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>Bepul boshlash</span>
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

      <div
        className="fu d5"
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(2, minmax(0, 1fr))"
            : "repeat(4, minmax(0, 1fr))",
          marginTop: "4.5rem",
          width: "100%",
          maxWidth: 680,
          margin: "4.5rem auto 0",
          border: "1px solid rgba(255,255,255,.07)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {stats.map(([num, label]) => (
          <div
            key={label}
            style={{
              minWidth: 120,
              padding: isMobile ? "1.2rem 0.8rem" : "1.5rem 1rem",
              textAlign: "center",
              background: "#0d1220",
              borderRight:
                !isMobile && label !== "AI ishlaydi"
                  ? "1px solid rgba(255,255,255,.07)"
                  : "none",
              borderBottom:
                isMobile &&
                (label === "Faol kompaniya" || label === "Mijoz mamnuniyati")
                  ? "1px solid rgba(255,255,255,.07)"
                  : "none",
            }}
          >
            <div
              style={{
                fontSize: "1.9rem",
                fontWeight: 800,
                color: "#0ea5e9",
                letterSpacing: "-0.02em",
              }}
            >
              {num}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,.32)",
                marginTop: 4,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
