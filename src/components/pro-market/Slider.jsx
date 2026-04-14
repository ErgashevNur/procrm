import { useEffect, useState } from "react";
import MaoBotSlide from "./MaoBotSlide";
import GenericSlide from "./GenericSlide";

export default function Slider({ SLIDES, C }) {
  const [cur, setCur] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const sync = () => setIsMobile(window.innerWidth < 768);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const prev = () => setCur((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCur((c) => (c + 1) % SLIDES.length);
  const left = SLIDES[(cur - 1 + SLIDES.length) % SLIDES.length];
  const center = SLIDES[cur];
  const right = SLIDES[(cur + 1) % SLIDES.length];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "18px 12px 32px" : "28px 0 36px",
        background: C.pageBg,
        overflow: "hidden",
      }}
    >
      {!isMobile && (
      <div
        style={{
          position: "absolute",
          left: 0,
          width: "20%",
          height: 260,
          background: left.bg,
          borderRadius: "0 14px 14px 0",
          opacity: 0.5,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          padding: "20px 18px",
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1.4,
          }}
        >
          {(left.title || left.label || "").split("\n")[0]}
        </div>
      </div>
      )}

      <button
        onClick={prev}
        style={{
          position: "absolute",
          left: isMobile ? 16 : "20%",
          zIndex: 10,
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "rgba(15,25,40,0.9)",
          border: `1px solid ${C.border}`,
          color: "#fff",
          fontSize: 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
        }}
      >
        ‹
      </button>

      <div
        style={{
          width: isMobile ? "100%" : "56%",
          maxWidth: isMobile ? "100%" : 800,
          minHeight: isMobile ? 220 : 260,
          background: center.bg,
          borderRadius: 14,
          position: "relative",
          overflow: "hidden",
          zIndex: 5,
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}
      >
        {center.maobot ? (
          <MaoBotSlide slide={center} C={C} />
        ) : (
          <GenericSlide slide={center} />
        )}
      </div>

      <button
        onClick={next}
        style={{
          position: "absolute",
          right: isMobile ? 16 : "20%",
          zIndex: 10,
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "rgba(15,25,40,0.9)",
          border: `1px solid ${C.border}`,
          color: "#fff",
          fontSize: 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
        }}
      >
        ›
      </button>

      {!isMobile && (
      <div
        style={{
          position: "absolute",
          right: 0,
          width: "20%",
          height: 260,
          background: right.bg,
          borderRadius: "14px 0 0 14px",
          opacity: 0.5,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          padding: "20px 18px",
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1.4,
          }}
        >
          {(right.title || right.label || "").split("\n")[0]}
        </div>
      </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 6,
        }}
      >
        {SLIDES.map((_, i) => (
          <div
            key={i}
            onClick={() => setCur(i)}
            style={{
              width: i === cur ? 22 : 6,
              height: 6,
              borderRadius: 3,
              background: i === cur ? "#fff" : "rgba(255,255,255,0.3)",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
