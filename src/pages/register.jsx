import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getGoogleAuthUrl } from "@/lib/auth";
import RegisterBackButton from "@/components/register/RegisterBackButton";
import RegisterBrand from "@/components/register/RegisterBrand";
import RegisterGoogleButton from "@/components/register/RegisterGoogleButton";
import RegisterHeader from "@/components/register/RegisterHeader";
import RegisterInfoPanel from "@/components/register/RegisterInfoPanel";
import RegisterInputField from "@/components/register/RegisterInputField";
import RegisterPasswordField from "@/components/register/RegisterPasswordField";
import { API_BASE, apiUrl } from "@/lib/api";
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
    if (!form.phoneNumber.trim()) nextErrors.phoneNumber = "Telefon raqam kiriting";
    if (form.phoneNumber.trim() && !/^\+998\d{9}$/.test(form.phoneNumber.trim())) {
      nextErrors.phoneNumber = "Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak";
    }
    if (!form.email.trim()) nextErrors.email = "Email kiriting";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
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
      const response = await fetch(apiUrl("company/public"), {
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
          getResponseMessage(payload, `Ro'yxatdan o'tishda xatolik (HTTP ${response.status})`),
        );
      }

      toast.success(
        getResponseMessage(payload, "Ro'yxatdan o'tish muvaffaqiyatli yakunlandi"),
      );
      setForm(initialForm);
      navigate("/login");
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
            <RegisterInfoPanel />
          )}

          <RegisterBrand className="mt-2 mb-4 flex items-center gap-3 xl:hidden" />
          <div className="mb-2 flex xl:hidden">
            <RegisterBackButton
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs leading-none font-medium text-white/70 transition-colors hover:border-white/15 hover:text-white sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs"
            />
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
            <RegisterHeader isMobile={isMobile} navigate={navigate} />

            <div style={{ display: "grid", gap: 16 }}>
              <RegisterInputField
                label="Kompaniya nomi *"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="ABC Group"
                style={inputStyle("name")}
                error={errors.name}
              />

              <RegisterInputField
                label="Telefon raqam *"
                value={form.phoneNumber}
                onChange={(e) => setField("phoneNumber", e.target.value)}
                placeholder="+998901234567"
                style={inputStyle("phoneNumber")}
                error={errors.phoneNumber}
              />

              <RegisterInputField
                label="Email *"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="company@mail.com"
                style={inputStyle("email")}
                error={errors.email}
              />

              <RegisterPasswordField
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                style={inputStyle("password")}
                error={errors.password}
              />

            

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

              <RegisterGoogleButton
                handleGoogleLogin={handleGoogleLogin}
                googleLoading={googleLoading}
                submitting={submitting}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
