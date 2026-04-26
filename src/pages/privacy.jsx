import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n, { LANGUAGE_DISPLAY, LANGUAGES, LANGUAGE_MAP } from "@/i18n/index.js";

const SECTIONS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];

const SECTION_ICONS = [
  <svg key="s1" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  <svg key="s2" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  <svg key="s3" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.3 24.3 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8 1.402 1.402c1 1 .03 2.798-1.442 2.465L15 18M5 14.5l-1.402 1.402c-1 1-.03 2.798 1.442 2.465L9 18" /></svg>,
  <svg key="s4" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
  <svg key="s5" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
  <svg key="s6" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  <svg key="s7" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
  <svg key="s8" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
];

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const sectionRefs = useRef({});

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const unsub = i18n.on("languageChanged", (lng) => setCurrentLang(lng));
    return () => i18n.off("languageChanged", unsub);
  }, []);

  const handleLangChange = (display) => {
    const code = LANGUAGE_MAP[display];
    i18n.changeLanguage(code);
    setCurrentLang(code);
    setLangOpen(false);
  };

  const scrollTo = (key) => {
    sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(key);
  };

  const bg = "#060d18";
  const cardBg = "rgba(255,255,255,.03)";
  const border = "rgba(255,255,255,.07)";
  const textMuted = "rgba(255,255,255,.38)";
  const textBody = "rgba(255,255,255,.62)";
  const accent = "#0ea5e9";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Inter, sans-serif", color: "#fff" }}>

      {/* nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        borderBottom: `1px solid ${border}`,
        background: "rgba(6,13,24,.88)",
        backdropFilter: "blur(16px)",
        padding: isMobile ? "0.75rem 1rem" : "0.85rem 2.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: "radial-gradient(circle at 50% 42%, rgba(255,255,255,.44), rgba(255,255,255,.2) 28%, rgba(255,255,255,.08) 48%, rgba(14,165,233,.18) 72%, rgba(14,165,233,.1) 100%)",
            border: "1px solid rgba(255,255,255,.82)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "inset 0 0 10px rgba(255,255,255,.4), inset 0 0 22px rgba(255,255,255,.22), 0 0 18px rgba(255,255,255,.1)",
          }}>
            <img src="/logo.png" alt="Kotibam" style={{ width: 17, height: 17, objectFit: "contain" }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>Kotibam</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* language switcher */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setLangOpen((p) => !p)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,.04)",
                border: `1px solid ${border}`,
                borderRadius: 8, padding: "6px 12px",
                color: "rgba(255,255,255,.6)", fontSize: 12, fontWeight: 500, cursor: "pointer",
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              {LANGUAGE_DISPLAY[currentLang] || "O'zbek"}
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 200,
                background: "#0d1424", border: `1px solid ${border}`,
                borderRadius: 10, overflow: "hidden", minWidth: 130,
                boxShadow: "0 8px 32px rgba(0,0,0,.6)",
              }}>
                {LANGUAGES.map((display) => {
                  const code = LANGUAGE_MAP[display];
                  return (
                    <button
                      key={code}
                      onClick={() => handleLangChange(display)}
                      style={{
                        display: "block", width: "100%", textAlign: "left",
                        padding: "9px 14px", fontSize: 13, cursor: "pointer",
                        background: currentLang === code ? "rgba(14,165,233,.12)" : "transparent",
                        color: currentLang === code ? accent : "rgba(255,255,255,.65)",
                        border: "none", fontFamily: "Inter, sans-serif",
                        transition: "background .15s",
                      }}
                    >
                      {display}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "transparent", border: `1px solid ${border}`,
              borderRadius: 8, padding: "6px 14px",
              color: "rgba(255,255,255,.55)", fontSize: 12, fontWeight: 500, cursor: "pointer",
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {!isMobile && t("privacy.backHome")}
          </button>
        </div>
      </nav>

      {/* hero */}
      <section style={{ position: "relative", padding: isMobile ? "3.5rem 1.2rem 2.8rem" : "5rem 2.5rem 3.5rem", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, borderRadius: "50%", background: "rgba(14,165,233,.06)", filter: "blur(80px)", pointerEvents: "none" }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(14,165,233,.1)", border: "1px solid rgba(14,165,233,.2)",
          borderRadius: 100, padding: "4px 14px", marginBottom: "1.4rem",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8" }} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", color: "rgba(56,189,248,.9)", textTransform: "uppercase" }}>
            Kotibam
          </span>
        </div>

        <h1 style={{
          fontSize: isMobile ? "2rem" : "clamp(2.2rem, 4vw, 3.4rem)",
          fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1,
          marginBottom: "0.9rem", color: "#fff",
        }}>
          {t("privacy.title")}
        </h1>

        <p style={{ maxWidth: 560, margin: "0 auto 0.8rem", fontSize: isMobile ? "0.9rem" : "1rem", lineHeight: 1.7, color: textBody }}>
          {t("privacy.subtitle")}
        </p>

        <p style={{ fontSize: 12, color: textMuted }}>
          {t("privacy.lastUpdated")}
        </p>
      </section>

      {/* content */}
      <div style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: isMobile ? "0 1rem 4rem" : "0 2.5rem 5rem",
        display: "flex",
        gap: 32,
        alignItems: "flex-start",
      }}>

        {/* sidebar toc (desktop only) */}
        {!isMobile && (
          <aside style={{
            width: 220, flexShrink: 0,
            position: "sticky", top: 72,
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: 14, padding: "1rem 0",
            overflow: "hidden",
          }}>
            {SECTIONS.map((key, i) => (
              <button
                key={key}
                onClick={() => scrollTo(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  width: "100%", textAlign: "left",
                  padding: "8px 16px",
                  background: activeSection === key ? "rgba(14,165,233,.1)" : "transparent",
                  borderLeft: activeSection === key ? `2px solid ${accent}` : "2px solid transparent",
                  color: activeSection === key ? accent : "rgba(255,255,255,.48)",
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                  border: "none", borderLeft: activeSection === key ? `2px solid ${accent}` : "2px solid transparent",
                  fontFamily: "Inter, sans-serif",
                  transition: "all .15s",
                }}
              >
                <span style={{ opacity: 0.7, flexShrink: 0 }}>{SECTION_ICONS[i]}</span>
                <span style={{ lineHeight: 1.35 }}>{t(`privacy.${key}Title`)}</span>
              </button>
            ))}
          </aside>
        )}

        {/* main sections */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* mobile quick nav */}
          {isMobile && (
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 8, marginBottom: 8,
            }}>
              {SECTIONS.map((key, i) => (
                <button
                  key={key}
                  onClick={() => scrollTo(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    background: cardBg, border: `1px solid ${border}`,
                    borderRadius: 10, padding: "9px 12px",
                    color: "rgba(255,255,255,.52)", fontSize: 11,
                    fontWeight: 500, cursor: "pointer", textAlign: "left",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <span style={{ opacity: 0.65, flexShrink: 0 }}>{SECTION_ICONS[i]}</span>
                  <span style={{ lineHeight: 1.3 }}>{t(`privacy.${key}Title`)}</span>
                </button>
              ))}
            </div>
          )}

          {SECTIONS.map((key, i) => (
            <section
              key={key}
              ref={(el) => { sectionRefs.current[key] = el; }}
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: 14,
                padding: isMobile ? "1.4rem 1.2rem" : "1.8rem 2rem",
                transition: "border-color .2s",
                borderColor: activeSection === key ? "rgba(14,165,233,.3)" : border,
              }}
              onClick={() => setActiveSection(key)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: "rgba(14,165,233,.1)",
                  border: "1px solid rgba(14,165,233,.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: accent,
                }}>
                  {SECTION_ICONS[i]}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                    color: "rgba(14,165,233,.6)", textTransform: "uppercase",
                    background: "rgba(14,165,233,.08)", borderRadius: 4, padding: "2px 7px",
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 style={{ fontSize: isMobile ? "1rem" : "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                    {t(`privacy.${key}Title`)}
                  </h2>
                </div>
              </div>
              <p style={{
                fontSize: isMobile ? "0.87rem" : "0.93rem",
                lineHeight: 1.8,
                color: textBody,
                margin: 0,
              }}>
                {t(`privacy.${key}Body`)}
              </p>
            </section>
          ))}

          {/* contact card */}
          <section style={{
            marginTop: 8,
            background: "linear-gradient(135deg, rgba(14,165,233,.08) 0%, rgba(99,102,241,.06) 100%)",
            border: "1px solid rgba(14,165,233,.2)",
            borderRadius: 16,
            padding: isMobile ? "2rem 1.4rem" : "2.4rem 2.4rem",
            textAlign: "center",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, margin: "0 auto 1.2rem",
              background: "rgba(14,165,233,.12)",
              border: "1px solid rgba(14,165,233,.24)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: accent,
            }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h3 style={{ fontSize: isMobile ? "1.1rem" : "1.25rem", fontWeight: 700, marginBottom: "0.6rem" }}>
              {t("privacy.contactTitle")}
            </h3>
            <p style={{ fontSize: "0.9rem", color: textBody, lineHeight: 1.7, marginBottom: "1.4rem", maxWidth: 420, margin: "0 auto 1.4rem" }}>
              {t("privacy.contactDesc")}
            </p>
            <a
              href="mailto:support@kotibam.uz"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: accent, color: "#fff",
                padding: "0.75rem 1.8rem", borderRadius: 10,
                fontSize: 13, fontWeight: 600, textDecoration: "none",
                transition: "opacity .15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              {t("privacy.contactBtn")}
            </a>
          </section>
        </div>
      </div>

      {/* footer */}
      <footer style={{
        borderTop: `1px solid ${border}`,
        padding: isMobile ? "1.4rem 1rem 2rem" : "1.8rem 2.5rem",
        display: "flex", alignItems: "center",
        justifyContent: isMobile ? "center" : "space-between",
        flexWrap: "wrap", gap: "1rem",
        textAlign: isMobile ? "center" : "left",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "radial-gradient(circle at 50% 42%, rgba(255,255,255,.44), rgba(255,255,255,.2) 28%, rgba(255,255,255,.08) 48%, rgba(14,165,233,.18) 72%, rgba(14,165,233,.1) 100%)",
            border: "1px solid rgba(255,255,255,.82)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "inset 0 0 10px rgba(255,255,255,.4), inset 0 0 22px rgba(255,255,255,.22)",
          }}>
            <img src="/logo.png" alt="Kotibam" style={{ width: 14, height: 14, objectFit: "contain" }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Kotibam</span>
        </div>
        <p style={{ fontSize: 12, color: textMuted }}>© 2026 Kotibam. Barcha huquqlar himoyalangan.</p>
      </footer>

      {/* close lang dropdown on outside click */}
      {langOpen && (
        <div
          onClick={() => setLangOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
        />
      )}
    </div>
  );
}
