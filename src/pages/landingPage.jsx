import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CtaSection from "@/components/landing/CtaSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HeroSection from "@/components/landing/HeroSection";
import HowSection from "@/components/landing/HowSection";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingNav from "@/components/landing/LandingNav";
import TestimonialsSection from "@/components/landing/TestimonialsSection";

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

      <LandingNav
        isMobile={isMobile}
        pagePadding={pagePadding}
        scrolled={scrolled}
        navigate={navigate}
      />

      <HeroSection
        isMobile={isMobile}
        pagePadding={pagePadding}
        navigate={navigate}
      />

      <FeaturesSection
        isMobile={isMobile}
        isTablet={isTablet}
        pagePadding={pagePadding}
        features={features}
      />

      <HowSection
        isMobile={isMobile}
        isTablet={isTablet}
        pagePadding={pagePadding}
        steps={steps}
      />

      <TestimonialsSection
        isMobile={isMobile}
        pagePadding={pagePadding}
        testimonials={testimonials}
      />

      <CtaSection isMobile={isMobile} pagePadding={pagePadding} />

      <LandingFooter isMobile={isMobile} pagePadding={pagePadding} />

    </div>
  );
}
