import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getDefaultRouteByRole, isSupportedRole } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { emitAuthChange } from "@/hooks/useNotification";
import LeftSlider from "@/components/login/LeftSlider";
import LoginBackButton from "@/components/login/LoginBackButton";
import LoginBrand from "@/components/login/LoginBrand";
import LoginCardHeader from "@/components/login/LoginCardHeader";
import LoginEmailField from "@/components/login/LoginEmailField";
import LoginInfoGrid from "@/components/login/LoginInfoGrid";
import LoginPasswordField from "@/components/login/LoginPasswordField";
import { API_BASE, apiUrl } from "@/lib/api";

// ─── Validation ───────────────────────────────────────────────────────────────

const getEmailError = (value) => {
  if (!value) return "Email kiritilishi shart";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Noto'g'ri email format";
  return "";
};

const getPasswordError = (value) => {
  if (!value) return "Parol kiritilishi shart";
  return "";
};

const parseJsonSafe = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const getResponseMessage = (payload) => {
  if (!payload) return "";
  if (typeof payload.message === "string") return payload.message;
  if (Array.isArray(payload.message)) return payload.message.join(", ");
  if (typeof payload.error === "string") return payload.error;
  return "";
};

const getLoginRequestError = (response, payload) => {
  const message = getResponseMessage(payload);
  if (response.status === 400 || response.status === 401)
    return message || "Login yoki parol noto'g'ri";
  if (response.status === 403)
    return message || "Sizga tizimga kirish uchun ruxsat berilmagan";
  if (response.status >= 500)
    return "Serverda xatolik yuz berdi. Keyinroq qayta urinib ko'ring";
  return message || "Kirishda xatolik yuz berdi";
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const navigate = useNavigate();

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]:
        field === "email" ? getEmailError(email) : getPasswordError(password),
    }));
  };

  const handleChange = (field, value) => {
    if (field === "email") setEmail(value);
    else setPassword(value);
    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]:
          field === "email" ? getEmailError(value) : getPasswordError(value),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim();
    setTouched({ email: true, password: true });
    const emailErr = getEmailError(normalizedEmail);
    const passErr = getPasswordError(password);
    setErrors({ email: emailErr, password: passErr });
    if (emailErr || passErr) return;

    setLoading(true);
    const loginRequest = async () => {
      if (!API_BASE) throw new Error("API manzili sozlanmagan");

      let response;
      try {
        response = await fetch(apiUrl("auth/login"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, password }),
        });
      } catch {
        throw new Error(
          "Server bilan bog'lanib bo'lmadi. Internetni tekshirib qayta urinib ko'ring",
        );
      }

      const data = await parseJsonSafe(response);
      if (!response.ok) throw new Error(getLoginRequestError(response, data));
      if (!data?.accessToken || !data?.user)
        throw new Error("Server login javobini to'liq qaytarmadi");

      const role = data.user.role;
      if (!isSupportedRole(role)) {
        localStorage.clear();
        throw new Error("Sizning profilingizga bu CRM da ruxsat berilmagan");
      }

      localStorage.setItem("user", data.accessToken);
      localStorage.setItem("companyId", data.user.companyId ?? "");
      localStorage.setItem(
        "isFirstLogin",
        String(Boolean(data.isFirstLogin ?? data.user.isFirstLogin)),
      );
      localStorage.setItem(
        "userData",
        JSON.stringify({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        }),
      );
      emitAuthChange();

      try {
        const projectsRes = await fetch(apiUrl("projects"), {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        if (projectsRes.ok) {
          const projects = await parseJsonSafe(projectsRes);
          if (Array.isArray(projects) && projects.length > 0) {
            localStorage.setItem("projectId", String(projects[0].id));
            localStorage.setItem("projectName", projects[0].name || "");
          }
        }
      } catch {
        // project tanlashni ProjectGate hal qiladi
      }

      navigate(getDefaultRouteByRole(role));
      return data;
    };

    toast.promise(
      loginRequest().finally(() => setLoading(false)),
      {
        loading: "Yuklanmoqda...",
        success: "Xush kelibsiz!",
        error: (err) => err?.message || "Kirishda xatolik",
      },
    );
  };

  const emailHasError = touched.email && errors.email;
  const passwordHasError = touched.password && errors.password;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b12]">
      {/* faint background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 h-[600px] w-[600px] translate-x-1/4 -translate-y-1/4 rounded-full bg-sky-500/[0.05] blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/4 translate-y-1/4 rounded-full bg-indigo-500/[0.04] blur-[100px]" />
      </div>

      <div className="relative z-10 grid min-h-screen xl:grid-cols-[1.1fr_0.9fr]">
        <LeftSlider />

        {/* ── Right: form panel ── */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[420px]">
            {/* Mobile brand */}
            <LoginBrand className="mb-8 flex items-center gap-3 xl:hidden" />
            <div className="mb-4 flex xl:hidden">
              <LoginBackButton
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs leading-none font-medium text-white/70 transition-colors hover:border-white/15 hover:text-white sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs"
              />
            </div>

            {/* Card */}
            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-sm sm:p-8">
              {/* Header */}
              <LoginCardHeader navigate={navigate} />

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Email */}
                <LoginEmailField
                  email={email}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  emailHasError={emailHasError}
                  errors={errors}
                />

                {/* Password */}
                <LoginPasswordField
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  password={password}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  passwordHasError={passwordHasError}
                  errors={errors}
                />

                {/* Info grid */}
                <LoginInfoGrid />

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-xl bg-sky-500 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(14,165,233,0.22)] transition-all hover:bg-sky-400 hover:shadow-[0_16px_40px_rgba(14,165,233,0.32)] disabled:opacity-60"
                >
                  {loading ? "Yuklanmoqda..." : "Kirish"}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
