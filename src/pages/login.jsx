import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { getDefaultRouteByRole, isSupportedRole } from "@/lib/rbac";

const slides = [
  {
    // Tasks / Checklist animation
    src: "/ai_agent.json",
    title: "AI Yordamchi!",
    desc: "AI yordamchingiz bilan ishlaringizni tezroq bajaring va samaradorlikni oshiring",
  },
  {
    // Leads / People / CRM - customers animation
    src: "/login.json",
    title: "Leadlarni boshqaring",
    desc: "Barcha mijozlaringizni va leadlarni bir joyda kuzatib boring",
  },
  {
    // Analytics / Chart animation
    src: "/analitic.json",
    title: "Hisobotlarni tahlil qiling",
    desc: "Real vaqt statistikasi bilan biznesingizni o'sishini kuzating",
  },
];

function LeftSlider() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setVisible(false);
      setTimeout(() => {
        // Change slide
        setCurrent((prev) => (prev + 1) % slides.length);
        // Fade in
        setVisible(true);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[current];

  return (
    <div
      className="hidden min-h-screen w-1/2 flex-col items-center justify-center gap-6 md:flex"
      style={{ background: "#131e2e" }}
    >
      {/* Logo — always visible */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "#1e3a5f" }}
        >
          <img src="/ProHomeLogo.png" alt="" />
        </div>
        <span className="text-2xl font-bold tracking-wide text-white">
          Pro Home CRM
        </span>
      </div>

      {/* Animation + Text — fades together */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.5s ease",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <DotLottieReact
          key={current}
          src={slide.src}
          loop
          autoplay
          style={{ width: 400, height: 400 }}
        />
        <div className="px-12 text-center">
          <h3 className="mb-2 text-xl font-semibold text-white">
            {slide.title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-400">{slide.desc}</p>
        </div>
      </div>

      {/* Dots */}
      <div className="flex gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => {
              setVisible(false);
              setTimeout(() => {
                setCurrent(i);
                setVisible(true);
              }, 500);
            }}
            className="cursor-pointer rounded-full"
            style={{
              width: i === current ? "20px" : "8px",
              height: "8px",
              background: i === current ? "#2563eb" : "#1e3a5f",
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

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

  if (response.status === 400 || response.status === 401) {
    return message || "Login yoki parol noto'g'ri";
  }

  if (response.status === 403) {
    return message || "Sizga tizimga kirish uchun ruxsat berilmagan";
  }

  if (response.status >= 500) {
    return "Serverda xatolik yuz berdi. Keyinroq qayta urinib ko'ring";
  }

  return message || "Kirishda xatolik yuz berdi";
};

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
      const apiBase = import.meta.env.VITE_VITE_API_KEY_PROHOME;
      if (!apiBase) {
        throw new Error("API manzili sozlanmagan");
      }

      let response;
      try {
        response = await fetch(`${apiBase}/auth/login`, {
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

      if (!response.ok) {
        throw new Error(getLoginRequestError(response, data));
      }

      if (!data?.accessToken || !data?.user) {
        throw new Error("Server login javobini to'liq qaytarmadi");
      }

      const role = data.user.role;
      if (!isSupportedRole(role)) {
        localStorage.clear();
        throw new Error("Sizning profilingizga bu CRM da ruxsat berilmagan");
      }

      localStorage.setItem("user", data.accessToken);
      localStorage.setItem("companyId", data.user.companyId ?? "");
      localStorage.setItem(
        "userData",
        JSON.stringify({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        }),
      );

      try {
        const projectsRes = await fetch(`${apiBase}/projects`, {
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

  return (
    <div className="flex min-h-screen w-full" style={{ background: "#0f1724" }}>
      {/* Left — Slideshow panel */}
      <LeftSlider />

      {/* Right — Form panel */}
      <div
        className="flex min-h-screen flex-1 flex-col items-center justify-center px-8 py-10 md:px-16"
        style={{ background: "#0f1724" }}
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 md:hidden">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "#1e3a5f" }}
            >
              <svg
                className="h-4 w-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <span className="font-semibold text-white">Pro Home CRM</span>
          </div>

          <h1 className="mb-1 text-2xl font-semibold text-white">Kirish</h1>
          <p className="mb-8 text-sm" style={{ color: "#64748b" }}>
            Hisobingizga kiring
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-medium text-slate-300"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                style={{
                  background:
                    touched.email && errors.email ? "#2a1a1a" : "#1a2535",
                  borderColor:
                    touched.email && errors.email ? "#f87171" : "#243044",
                  color: "#e2e8f0",
                }}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm placeholder-slate-600 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
              />
              {touched.email && errors.email && (
                <p className="text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-medium text-slate-300"
                  htmlFor="password"
                >
                  Parol
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  style={{
                    background:
                      touched.password && errors.password
                        ? "#2a1a1a"
                        : "#1a2535",
                    borderColor:
                      touched.password && errors.password
                        ? "#f87171"
                        : "#243044",
                    color: "#e2e8f0",
                  }}
                  className={`w-full rounded-lg border px-4 py-2.5 pr-10 text-sm placeholder-slate-600 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                  style={{ color: "#475569" }}
                >
                  {showPassword ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-lg py-2.5 text-sm font-medium text-white transition-all duration-150 active:scale-[0.99] disabled:cursor-not-allowed"
              style={{
                background: loading ? "#1e3a5f" : "#2563eb",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "#1d4ed8";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = "#2563eb";
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Yuklanmoqda...
                </span>
              ) : (
                "Kirish"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
