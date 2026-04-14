export default function TestimonialsSection({
  isMobile,
  pagePadding,
  testimonials,
}) {
  return (
    <section
      id="testimonials"
      style={{
        padding: isMobile ? "3.5rem 1rem" : `5rem ${pagePadding}`,
        background: "#080d17",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
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
          Mijozlar fikri
        </div>
        <h2
          style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#fff",
          }}
        >
          Ular allaqachon o'sdi
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
          gap: "1.2rem",
        }}
      >
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="t-card"
            style={{
              background: "#0b1018",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 18,
              padding: "1.8rem",
            }}
          >
            <div
              style={{
                color: "#f59e0b",
                fontSize: 13,
                marginBottom: "1rem",
                letterSpacing: 2,
              }}
            >
              ★★★★★
            </div>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,.43)",
                lineHeight: 1.77,
                fontStyle: "italic",
                marginBottom: "1.3rem",
                fontWeight: 300,
              }}
            >
              "{t.text}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: t.color + "22",
                  border: `1px solid ${t.color}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: t.color,
                }}
              >
                {t.initials}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  {t.name}
                </div>
                <div
                  style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}
                >
                  {t.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
