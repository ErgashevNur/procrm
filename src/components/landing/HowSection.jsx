export default function HowSection({ isMobile, isTablet, pagePadding, steps }) {
  return (
    <section
      id="how"
      style={{ padding: isMobile ? "3.5rem 1rem" : `5rem ${pagePadding}` }}
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
          Qanday ishlaydi
        </div>
        <h2
          style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#fff",
          }}
        >
          4 qadamda tayyor
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : isTablet
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(4, minmax(0, 1fr))",
          gap: "1.5rem",
          maxWidth: 900,
          margin: "0 auto",
          justifyContent: "center",
        }}
      >
        {steps.map((s) => (
          <div key={s.num} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "3.2rem",
                fontWeight: 800,
                color: "rgba(14,165,233,.12)",
                letterSpacing: "-0.04em",
                lineHeight: 1,
                marginBottom: "0.8rem",
              }}
            >
              {s.num}
            </div>
            <div
              style={{
                width: 30,
                height: 2,
                background: "#0ea5e9",
                borderRadius: 2,
                marginBottom: "0.9rem",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                marginBottom: 8,
              }}
            >
              {s.title}
            </div>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,.36)",
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
