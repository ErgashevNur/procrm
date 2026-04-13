export default function GenericSlide({ slide }) {
  return (
    <div
      style={{
        padding: "clamp(18px, 4vw, 32px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 220,
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🏦
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>
              {slide.label}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
              {slide.sublabel}
            </div>
          </div>
        </div>
        <div
          style={{
            fontWeight: 900,
            fontSize: "clamp(16px, 4vw, 20px)",
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.3,
            marginBottom: 10,
          }}
        >
          {(slide.title || "").split("\n").map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        <div
          style={{
            fontSize: "clamp(11px, 2.8vw, 12px)",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.6,
            maxWidth: 400,
          }}
        >
          {slide.body}
        </div>
      </div>
      {slide.cta && (
        <button
          style={{
            marginTop: 18,
            background: slide.ctaOutline ? "rgba(255,255,255,0.12)" : "#4D8EF5",
            border: slide.ctaOutline
              ? "1px solid rgba(255,255,255,0.25)"
              : "none",
            color: "#fff",
            borderRadius: 9,
            padding: "10px 22px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
        >
          {slide.cta}
        </button>
      )}
    </div>
  );
}
