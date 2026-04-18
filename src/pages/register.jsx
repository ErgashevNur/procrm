import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import { Eye, EyeOff } from "lucide-react";
import { getGoogleAuthUrl, persistAuthSession } from "@/lib/auth";
import { getDefaultRouteByRole } from "@/lib/rbac";

const API_BASE = import.meta.env.VITE_VITE_API_KEY_PROHOME;
const DEFAULT_PERMISSIONS = ["CRM"];

const initialForm = {
  name: "",
  phoneNumber: "",
  email: "",
  password: "",
};

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getResponseMessage(payload, fallback) {
  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }
  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  return fallback;
}

function hasAccessToken(payload) {
  const source =
    payload?.data && typeof payload.data === "object" ? payload.data : payload;
  if (!source || typeof source !== "object") return false;
  return Boolean(
    source.accessToken || source.access_token || source.token || source.jwt,
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );

  const isMobile = viewportWidth < 768;

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Kompaniya nomini kiriting";
    if (!form.phoneNumber.trim())
      nextErrors.phoneNumber = "Telefon raqam kiriting";
    if (
      form.phoneNumber.trim() &&
      !/^\+998\d{9}$/.test(form.phoneNumber.trim())
    ) {
      nextErrors.phoneNumber =
        "Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak";
    }
    if (!form.email.trim()) nextErrors.email = "Email kiriting";
    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Email noto'g'ri";
    }
    if (!form.password.trim()) nextErrors.password = "Parol kiriting";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate() || submitting) return;
    if (!API_BASE) {
      toast.error("API manzili sozlanmagan");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/company/public`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phoneNumber: form.phoneNumber.trim(),
          email: form.email.trim(),
          password: form.password,
          permissions: DEFAULT_PERMISSIONS,
        }),
      });

      const payload = await parseJsonSafe(response);

      if (!response.ok) {
        throw new Error(
          getResponseMessage(
            payload,
            `Ro'yxatdan o'tishda xatolik (HTTP ${response.status})`,
          ),
        );
      }

      toast.success(
        getResponseMessage(
          payload,
          "Ro'yxatdan o'tish muvaffaqiyatli yakunlandi",
        ),
      );

      if (hasAccessToken(payload)) {
        const authData = await persistAuthSession(payload, API_BASE);
        setForm(initialForm);
        navigate(getDefaultRouteByRole(authData.user.role), { replace: true });
        return;
      }

      setForm(initialForm);
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error?.message || "Ro'yxatdan o'tishda xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (key) => ({
    width: "100%",
    minHeight: 46,
    borderRadius: 12,
    border: `1px solid ${errors[key] ? "rgba(248,113,113,.7)" : "rgba(255,255,255,.08)"}`,
    background: "#0f1724",
    color: "#fff",
    padding: "0 14px",
    outline: "none",
    fontSize: 14,
  });

  const handleGoogleLogin = () => {
    if (googleLoading || submitting) return;

    try {
      const googleAuthUrl = getGoogleAuthUrl(API_BASE);
      setGoogleLoading(true);
      window.location.href = googleAuthUrl;
    } catch (error) {
      setGoogleLoading(false);
      toast.error(error?.message || "Google loginni boshlashda xatolik");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        overflowX: "hidden",
        background:
          "radial-gradient(circle at top, rgba(14,165,233,.12), transparent 25%), #070b12",
        color: "#fff",
        padding: isMobile ? "16px" : "20px",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr",
            gap: isMobile ? 16 : 24,
            alignItems: "start",
          }}
        >
          {!isMobile && (
            <div
              style={{
                background: "rgba(11,16,24,.9)",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 24,
                padding: 32,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(14,165,233,.1)",
                  border: "1px solid rgba(14,165,233,.2)",
                  color: "#38bdf8",
                  fontSize: 12,
                  marginBottom: 18,
                }}
              >
                Public Register
              </div>

              <h1
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.3rem)",
                  lineHeight: 1.05,
                  fontWeight: 800,
                  marginBottom: 14,
                }}
              >
                Kompaniyangizni
                <br />
                tizimga ulang
              </h1>

              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,.55)",
                  marginBottom: 28,
                  maxWidth: 520,
                }}
              >
                Siz bergan `company/public` endpointiga mos ro'yxatdan o'tish
                formasi. So'rov faqat kerakli maydonlar bilan yuboriladi.
              </p>

              <div style={{ display: "grid", gap: 14 }}>
                {[
                  "Kompaniya nomi va manager ma'lumoti",
                  "Telefon, email va password yuborish",
                  "Permission avtomatik CRM sifatida yuboriladi",
                  "Logo bilan multipart/form-data jo'natish",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: "#0f1724",
                      border: "1px solid rgba(255,255,255,.06)",
                      color: "rgba(255,255,255,.78)",
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 mb-4 flex items-center gap-3 xl:hidden">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background:
                  "radial-gradient(circle at 50% 42%, rgba(255,255,255,.44), rgba(255,255,255,.2) 28%, rgba(255,255,255,.08) 48%, rgba(14,165,233,.18) 72%, rgba(14,165,233,.1) 100%)",
                border: "1px solid rgba(255,255,255,.82)",
                boxShadow:
                  "inset 0 0 10px rgba(255,255,255,.4), inset 0 0 22px rgba(255,255,255,.22), inset 0 0 42px rgba(255,255,255,.12), 0 0 18px rgba(255,255,255,.12)",
              }}
            >
              <img src="/logo.png" alt="Kotibam" className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold tracking-[0.26em] text-white/40 uppercase">
              Kotibam
            </span>
          </div>
          <div className="mb-2 flex xl:hidden">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs leading-none font-medium text-white/70 transition-colors hover:border-white/15 hover:text-white sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs"
            >
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span aria-hidden="true">←</span>
                <span>Orqaga</span>
              </span>
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              background: "rgba(11,16,24,.96)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 24,
              padding: isMobile ? 20 : 32,
              width: "100%",
              maxWidth: isMobile ? 420 : "100%",
            }}
          >
            <div
              style={{
                marginBottom: 24,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <p
                  style={{
                    marginBottom: 12,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.28em",
                    color: "rgba(56,189,248,.8)",
                    textTransform: "uppercase",
                  }}
                >
                  Ro'yxatdan o'tish
                </p>
                <h1
                  style={{
                    fontSize: isMobile ? 24 : 26,
                    lineHeight: 1.15,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    color: "#fff",
                  }}
                >
                  Hisobingizni yarating
                </h1>
                <p
                  style={{
                    marginTop: 12,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,.38)",
                  }}
                >
                  Kerakli ma'lumotlarni kiriting va kompaniyangizni ulang.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="hidden items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs leading-none font-medium text-white/70 transition-colors hover:border-white/15 hover:text-white sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs xl:inline-flex"
              >
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <span aria-hidden="true">←</span>
                  <span>Orqaga</span>
                </span>
              </button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label
                  style={{ display: "block", fontSize: 13, marginBottom: 8 }}
                >
                  Kompaniya nomi *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="ABC Group"
                  style={inputStyle("name")}
                />
                {errors.name && (
                  <p style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  style={{ display: "block", fontSize: 13, marginBottom: 8 }}
                >
                  Telefon raqam *
                </label>
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setField("phoneNumber", e.target.value)}
                  placeholder="+998 ** *** ** **"
                  style={inputStyle("phoneNumber")}
                />
                {errors.phoneNumber && (
                  <p style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label
                  style={{ display: "block", fontSize: 13, marginBottom: 8 }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="company@mail.com"
                  style={inputStyle("email")}
                />
                {errors.email && (
                  <p style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  style={{ display: "block", fontSize: 13, marginBottom: 8 }}
                >
                  Parol *
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder="Parol kiriting"
                    style={{ ...inputStyle("password"), paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"
                    }
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      color: "rgba(255,255,255,.65)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      padding: 4,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  height: 44,
                  borderRadius: 12,
                  border: "none",
                  background: "#0ea5e9",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || submitting}
                style={{
                  height: 44,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.08)",
                  background: "#111927",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor:
                    googleLoading || submitting ? "not-allowed" : "pointer",
                  opacity: googleLoading || submitting ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: "#fff",
                    border: "1px solid rgba(255,255,255,.12)",
                    boxShadow: "0 2px 10px rgba(0,0,0,.18)",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M21.805 12.23c0-.79-.069-1.546-.198-2.272H12v4.302h5.498a4.701 4.701 0 0 1-2.04 3.084v2.56h3.305c1.935-1.782 3.042-4.408 3.042-7.674Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 22c2.754 0 5.062-.913 6.75-2.477l-3.305-2.56c-.913.613-2.08.975-3.445.975-2.648 0-4.89-1.787-5.693-4.19H2.89v2.64A9.998 9.998 0 0 0 12 22Z"
                      fill="#34A853"
                    />
                    <path
                      d="M6.307 13.748A5.996 5.996 0 0 1 5.988 12c0-.607.11-1.196.319-1.748v-2.64H2.89A9.998 9.998 0 0 0 2 12c0 1.61.385 3.13 1.069 4.388l3.238-2.64Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 6.062c1.496 0 2.84.515 3.898 1.527l2.924-2.924C17.058 3.026 14.75 2 12 2A9.998 9.998 0 0 0 2.89 7.612l3.417 2.64c.803-2.403 3.045-4.19 5.693-4.19Z"
                      fill="#EA4335"
                    />
                  </svg>
                </span>
                {googleLoading ? "Google ochilmoqda..." : "Google bilan kirish"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
