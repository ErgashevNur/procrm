export default function FeaturesSection({
  isMobile,
  isTablet,
  pagePadding,
  features,
}) {
  return (
    <section
      id="features"
      style={{
        padding: isMobile ? "3.5rem 1rem" : `5rem ${pagePadding}`,
        background: "#080d17",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "rgba(56,189,248,.8)",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Imkoniyatlar
        </div>
        <h2
          style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#fff",
            marginBottom: 12,
          }}
        >
          Biznesingiz uchun hamma narsa
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,.38)",
            fontSize: 15,
            maxWidth: 500,
            margin: "0 auto",
            fontWeight: 300,
          }}
        >
          Bir platformada — AI kotib, pipeline, tahlil va jamoa boshqaruvi.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : isTablet
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(3, minmax(0, 1fr))",
          gap: "1px",
          background: "rgba(255,255,255,.06)",
          border: "1px solid rgba(255,255,255,.06)",
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        {features.map((f) => (
          <div
            key={f.title}
            className="feat-card"
            style={{
              background: "#0b1018",
              padding: isMobile ? "1.4rem" : "2.2rem",
              border: "1px solid transparent",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 11,
                background: "rgba(14,165,233,.1)",
                border: "1px solid rgba(14,165,233,.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#38bdf8",
                marginBottom: "1.2rem",
              }}
            >
              {f.icon}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                marginBottom: 8,
              }}
            >
              {f.title}
            </div>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,.36)",
                lineHeight: 1.72,
                fontWeight: 300,
              }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
