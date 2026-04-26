import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.3 24.3 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8 1.402 1.402c1 1 .03 2.798-1.442 2.465L15 18M5 14.5l-1.402 1.402c-1 1-.03 2.798 1.442 2.465L9 18" />
      </svg>
    ),
    title: "AI Kotib",
    desc: "Har bir qo'ng'iroq, xabar va vazifani AI avtomatik qayd etadi. Hech narsa esdan chiqmaydi.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Real vaqt analitika",
    desc: "Savdo hajmi, lead holati va jamoa samaradorligini jonli dashboard orqali kuzating.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "Jamoa boshqaruvi",
    desc: "Har bir xodimga vazifa belgilang, kuzating va baholang — hamma bir tizimda.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3 1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: "Lead pipeline",
    desc: "Har bir mijoz qaysi bosqichda ekanini aniq ko'ring. Hech kim tushib qolmaydi.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: "Aqlli eslatmalar",
    desc: "Muhim uchrashuvlar, follow-uplar va deadline'larni AI o'zi eslatib turadi.",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "Xavfsiz va tez",
    desc: "Rol asosida ruxsat va tezkor serverlar bilan ma'lumotlaringiz doim himoyada.",
  },
];

const steps = [
  { num: "01", title: "Ro'yxatdan o'ting", desc: "30 soniyada bepul hisob oching." },
  { num: "02", title: "Jamoangizni qo'shing", desc: "Xodimlarni taklif qiling, rol va ruxsatlarni belgilang." },
  { num: "03", title: "Leadlarni kiriting", desc: "Mijozlarni qo'shing yoki mavjud CRM dan import qiling." },
  { num: "04", title: "O'sishni kuzating", desc: "AI tahlili va dashboard orqali natijani real vaqtda ko'ring." },
];

const testimonials = [
  {
    name: "Wenny Estate",
    role: "CEO, TechUz",
    initials: "JM",
    color: "#0ea5e9",
    text: "Kotibam bizning savdomizni 3 oyda ikki barobarga oshirdi. Pipeline va AI eslatmalar — eng zo'r xususiyat.",
  },
  {
    name: "Kafsan Group",
    role: "Sales Director, BrandHub",
    initials: "NK",
    color: "#8b5cf6",
    text: "Ilgari Excel bilan boshim og'rirdi. Endi hamma narsa bir joyda, jamoa ham xursand, men ham.",
  },
  {
    name: "Hengtai Group",
    role: "Founder, DigitalFlow",
    initials: "AT",
    color: "#10b981",
    text: "Eng yaxshi tomoni — real vaqt analitika. Qaysi menejer qancha lead yopayotganini darhol ko'raman.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Bepul",
    desc: "Kichik jamoa uchun",
    features: ["5 ta foydalanuvchi", "100 ta lead", "Asosiy pipeline", "Email qo'llab-quvvatlash"],
    cta: "Boshlash",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/oy",
    desc: "O'sib borayotgan biznes uchun",
    features: ["Cheksiz foydalanuvchi", "Cheksiz lead", "AI kotib", "Real vaqt analitika", "Ustuvor support"],
    cta: "14 kun bepul sinab ko'ring",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Kelishamiz",
    desc: "Yirik korporatsiyalar uchun",
    features: ["Maxsus integratsiyalar", "Dedicated server", "SLA kafolat", "Shaxsiy menejer"],
    cta: "Bog'laning",
    highlight: false,
  },
];

function Modal({ onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Ismingizni kiriting";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "To'g'ri email kiriting";
    }
    if (!form.phone.trim()) e.phone = "Telefon raqam kiriting";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1500);
  };

  const inputStyle = (key) => ({
    width: "100%",
    height: 42,
    borderRadius: 10,
    border: `1px solid ${errors[key] ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.08)"}`,
    background: errors[key] ? "rgba(239,68,68,.05)" : "rgba(255,255,255,.04)",
    padding: "0 14px",
    color: "#fff",
    fontSize: 13,
    outline: "none",
    fontFamily: "Inter, sans-serif",
    transition: "border-color .2s",
  });

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          background: "#0d1220",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 24,
          padding: "2.2rem",
          width: "100%",
          maxWidth: 420,
          animation: "modalIn .35s ease",
        }}
      >
        <style>{`@keyframes modalIn{from{transform:translateY(24px) scale(.96);opacity:0}to{transform:none;opacity:1}}`}</style>

        {done ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(16,185,129,.15)",
                border: "1px solid rgba(16,185,129,.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.2rem",
              }}
            >
              <svg width="28" height="28" fill="none" stroke="#10b981" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Tabriklaymiz! 🎉</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", lineHeight: 1.7 }}>
              Hisobingiz yaratildi.
              <br />
              Email manzilingizga tasdiqlash xati yuborildi.
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: "1.8rem",
                width: "100%",
                height: 44,
                borderRadius: 10,
                border: "none",
                background: "#0ea5e9",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Davom etish →
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(56,189,248,.8)", textTransform: "uppercase", marginBottom: 6 }}>
                  Bepul boshlash
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Hisob oching</div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 6 }}>30 kun bepul. Karta talab etilmaydi.</p>
              </div>
              <button
                onClick={onClose}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,.3)", cursor: "pointer", fontSize: 20, lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            {[
              { key: "name", label: "Ism Familiya", placeholder: "Jasur Mirzayev", type: "text" },
              { key: "email", label: "Email", placeholder: "jasur@mail.com", type: "email" },
              { key: "phone", label: "Telefon", placeholder: "+998 90 123 45 67", type: "tel" },
              { key: "company", label: "Kompaniya (ixtiyoriy)", placeholder: "TechUz LLC", type: "text" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key} style={{ marginBottom: "0.9rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.35)",
                    marginBottom: 6,
                  }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, [key]: e.target.value }));
                    setErrors((er) => ({ ...er, [key]: "" }));
                  }}
                  style={inputStyle(key)}
                />
                {errors[key] && (
                  <p style={{ marginTop: 4, fontSize: 11, color: "rgba(248,113,113,.9)" }}>{errors[key]}</p>
                )}
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%",
                height: 44,
                borderRadius: 10,
                border: "none",
                background: "#0ea5e9",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                marginTop: 6,
                fontFamily: "Inter, sans-serif",
                transition: "background .2s",
              }}
            >
              {loading ? "Yuklanmoqda..." : "Ro'yxatdan o'tish →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1100;
  const pagePadding = isMobile ? "1rem" : isTablet ? "4.5%" : "6%";

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#070b12",
        color: "#f0f4ff",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { transform: translateY(30px); opacity: 0; } to { transform: none; opacity: 1; } }
        .fu { animation: fadeUp .7s ease both; }
        .d1{animation-delay:.1s} .d2{animation-delay:.2s} .d3{animation-delay:.25s} .d4{animation-delay:.35s} .d5{animation-delay:.45s}
        .feat-card { transition: background .25s, border-color .25s; }
        .feat-card:hover { background: #141d2e !important; border-color: rgba(14,165,233,.25) !important; }
        .t-card { transition: border-color .25s; }
        .t-card:hover { border-color: rgba(14,165,233,.22) !important; }
        .plan-card { transition: transform .25s; }
        .plan-card:hover { transform: translateY(-5px); }
        .nav-a { transition: color .2s; }
        .nav-a:hover { color: #fff !important; }
        .btn-s { transition: background .2s; }
        .btn-s:hover { background: #38bdf8 !important; }
        .btn-g { transition: border-color .2s, color .2s; }
        .btn-g:hover { border-color: rgba(255,255,255,.28) !important; color: #fff !important; }
      `}</style>

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
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 10, minWidth: 0, flexShrink: 1 }}>
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


        <div style={{ display: "flex", gap: isMobile ? 8 : 10, width: "auto", flexShrink: 0 }}>
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

      <section style={{ padding: isMobile ? "4.5rem 1rem 3.5rem" : `7rem ${pagePadding} 5rem`, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: isMobile ? 380 : 700, height: isMobile ? 380 : 700, borderRadius: "50%", background: "rgba(14,165,233,.08)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 180, left: "5%", width: isMobile ? 180 : 300, height: isMobile ? 180 : 300, borderRadius: "50%", background: "rgba(99,102,241,.06)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 150, right: "5%", width: isMobile ? 160 : 260, height: isMobile ? 160 : 260, borderRadius: "50%", background: "rgba(16,185,129,.05)", filter: "blur(55px)", pointerEvents: "none" }} />

        <div className="fu d1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(14,165,233,.1)", border: "1px solid rgba(14,165,233,.2)", borderRadius: 100, padding: "5px 16px", marginBottom: "1.8rem" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8" }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", color: "rgba(56,189,248,.9)", textTransform: "uppercase" }}>
            O'zbekistondagi №1 AI CRM
          </span>
        </div>

        <h1 className="fu d2" style={{ fontSize: "clamp(2.6rem, 6vw, 5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "1.4rem", color: "#fff" }}>
          Biznesingizning
          <br />
          <span style={{ color: "#0ea5e9" }}>aqlli kotibi</span>
        </h1>

        <p className="fu d3" style={{ maxWidth: 580, margin: "0 auto 2.8rem", fontSize: isMobile ? "0.96rem" : "1.05rem", lineHeight: isMobile ? 1.7 : 1.78, color: "rgba(255,255,255,.44)", fontWeight: 300 }}>
          Kotibam — savdo jamoalari uchun yaratilgan  CRM platforma.
          <br />
          Leadlar, vazifalar, tahlil va AI kotib — hammasi bitta tizimda.
        </p>

        <div className="fu d4" style={{ display: "flex", gap: "0.9rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            className="btn-s"
            onClick={() => navigate("/register")}
            style={{ background: "#0ea5e9", border: "none", color: "#fff", padding: "0.85rem 2rem", fontSize: 15, borderRadius: 10, fontFamily: "Inter, sans-serif", fontWeight: 600, cursor: "pointer" }}
          >
            Bepul boshlash →
          </button>
        </div>

        <div
          className="fu d5"
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
            marginTop: "4.5rem",
            width: "100%",
            maxWidth: 680,
            margin: "4.5rem auto 0",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {[["500+", "Faol kompaniya"], ["98%", "Mijoz mamnuniyati"], ["3x", "Savdo o'sishi"], ["24/7", "AI ishlaydi"]].map(
            ([num, label]) => (
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
                    isMobile && (label === "Faol kompaniya" || label === "Mijoz mamnuniyati")
                      ? "1px solid rgba(255,255,255,.07)"
                      : "none",
                }}
              >
                <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#0ea5e9", letterSpacing: "-0.02em" }}>{num}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.32)", marginTop: 4 }}>{label}</div>
              </div>
            )
          )}
        </div>
      </section>

      <section id="features" style={{ padding: isMobile ? "3.5rem 1rem" : `5rem ${pagePadding}`, background: "#080d17" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(56,189,248,.8)", textTransform: "uppercase", marginBottom: 12 }}>Imkoniyatlar</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", marginBottom: 12 }}>
            Biznesingiz uchun hamma narsa
          </h2>
          <p style={{ color: "rgba(255,255,255,.38)", fontSize: 15, maxWidth: 500, margin: "0 auto", fontWeight: 300 }}>
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
              style={{ background: "#0b1018", padding: isMobile ? "1.4rem" : "2.2rem", border: "1px solid transparent" }}
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
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{f.title}</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.36)", lineHeight: 1.72, fontWeight: 300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" style={{ padding: isMobile ? "3.5rem 1rem" : `5rem ${pagePadding}` }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(56,189,248,.8)", textTransform: "uppercase", marginBottom: 12 }}>Qanday ishlaydi</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>4 qadamda tayyor</h2>
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
          }}
        >
          {steps.map((s) => (
            <div key={s.num}>
              <div style={{ fontSize: "3.2rem", fontWeight: 800, color: "rgba(14,165,233,.12)", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "0.8rem" }}>
                {s.num}
              </div>
              <div style={{ width: 30, height: 2, background: "#0ea5e9", borderRadius: 2, marginBottom: "0.9rem" }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{s.title}</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.36)", lineHeight: 1.7, fontWeight: 300 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="testimonials" style={{ padding: isMobile ? "3.5rem 1rem" : `5rem ${pagePadding}`, background: "#080d17" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(56,189,248,.8)", textTransform: "uppercase", marginBottom: 12 }}>Mijozlar fikri</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>Ular allaqachon o'sdi</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "1.2rem" }}>
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="t-card"
              style={{ background: "#0b1018", border: "1px solid rgba(255,255,255,.07)", borderRadius: 18, padding: "1.8rem" }}
            >
              <div style={{ color: "#f59e0b", fontSize: 13, marginBottom: "1rem", letterSpacing: 2 }}>★★★★★</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.43)", lineHeight: 1.77, fontStyle: "italic", marginBottom: "1.3rem", fontWeight: 300 }}>
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
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      

      <section style={{ padding: isMobile ? "0 1rem 3.5rem" : `0 ${pagePadding} 5rem` }}>
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
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%,rgba(14,165,233,.07),transparent 60%)", pointerEvents: "none" }} />
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: 12, position: "relative" }}>
            Bugun boshlang — bepul
          </h2>
      
          <button
            className="btn-s"
            style={{ background: "#0ea5e9", border: "none", color: "#fff", padding: "0.85rem 2.2rem", fontSize: 15, borderRadius: 10, fontFamily: "Inter, sans-serif", fontWeight: 600, cursor: "pointer", position: "relative" }}
          >
            Bepul ro'yxatdan o'tish →
          </button>
        </div>
      </section>

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
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Kotibam</span>
        </div>

     

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-end" }}>
          <a
            href="/privacy"
            style={{ fontSize: 12, color: "rgba(255,255,255,.28)", textDecoration: "none", transition: "color .15s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,.65)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,.28)"}
          >
            Maxfiylik siyosati
          </a>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.18)" }}>© 2026 Kotibam. Barcha huquqlar himoyalangan.</span>
        </div>
      </footer>

    </div>
  );
}
