import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { getDefaultRouteByRole, isSupportedRole } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emitAuthChange } from "@/hooks/useNotification";

const slides = [
  {
    src: "/ai_agent.json",
    title: "AI yordamchi ish ritmini ushlab turadi",
    desc: "Takroriy jarayonlarni tezlashtirib, jamoaning kundalik ishini bir markazdan boshqarishga yordam beradi.",
    stat: "24/7 avtomatlashtirish",
  },
  {
    src: "/login.json",
    title: "Leadlar yo'qolib ketmaydi",
    desc: "Har bir mijoz, status va keyingi qadam bitta pipeline ichida aniq ko'rinadi.",
    stat: "CRM nazorati",
  },
  {
    src: "/analitic.json",
    title: "Raqamlar qarorni tezlashtiradi",
    desc: "Real vaqt analitikasi bilan savdo jarayonidagi o'sish nuqtalarini darhol ko'rasiz.",
    stat: "Jonli hisobotlar",
  },
];

function LeftSlider() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      const timeout = setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setVisible(true);
      }, 280);
      return () => clearTimeout(timeout);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[current];

  return (
    <aside className="relative hidden h-screen flex-1 overflow-hidden xl:flex">
      {/* Background */}
      <div className="absolute inset-0 " />

      {/* Inner card border */}
      <div className="absolute inset-y-10 left-10 right-10 rounded-[36px] border border-white/10 bg-white/[0.03]" />

      {/* Content */}
      <div
        className="relative z-10 flex w-full flex-col items-center justify-center gap-5 px-16 py-6 transition-all duration-300"
        style={{
          opacity: visible ? 1 : 0.28,
          transform: visible ? "translateY(0)" : "translateY(10px)",
        }}
      >
        {/* 1. LOGO */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-[0_0_0_8px_rgba(56,189,248,0.06),0_12px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <img src="/ProHomeLogo.png" alt="Pro Home CRM" className="h-10 w-10" />
        </div>

        {/* 2. TITLE */}
        <div className="text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-400">
            Pro Home CRM
          </p>
          <h2 className="text-3xl font-semibold leading-snug text-white">
            {slide.title}
          </h2>
        </div>

        {/* 3. STAT BADGE */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-xl">
          <span className="inline-flex rounded-full bg-sky-400/15 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300">
            {slide.stat}
          </span>
          <span className="text-sm text-slate-400">
            Tizimga kirganingizdan keyin barcha jarayonlar shu yerdan.
          </span>
        </div>

        {/* 4. ANIMATION */}
        <div className="w-full max-w-xs rounded-[24px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_22px_80px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
          <DotLottieReact
            key={current}
            src={slide.src}
            loop
            autoplay
            style={{ width: "100%", height: 200 }}
          />
        </div>

        {/* 5. DESCRIPTION */}
        <div className="max-w-sm text-center">
          <p className="text-sm leading-6 text-slate-300">{slide.desc}</p>
        </div>

        {/* Dot indicators */}
        <div className="flex gap-2">
          {slides.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                setVisible(false);
                setTimeout(() => {
                  setCurrent(index);
                  setVisible(true);
                }, 280);
              }}
              className={`h-2.5 rounded-full transition-all ${
                index === current
                  ? "w-10 bg-sky-400"
                  : "w-2.5 bg-white/20 hover:bg-white/35"
              }`}
              aria-label={`${index + 1}-slayd`}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ── Validation helpers ── */
const getEmailError = (value) => {
  if (!value) return "Email kiritilishi shart";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Noto'g'ri email format";
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

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-rose-400">{message}</p>;
}

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
      [field]: field === "email" ? getEmailError(email) : getPasswordError(password),
    }));
  };

  const handleChange = (field, value) => {
    if (field === "email") setEmail(value);
    else setPassword(value);
    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: field === "email" ? getEmailError(value) : getPasswordError(value),
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
      if (!apiBase) throw new Error("API manzili sozlanmagan");

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

    toast.promise(loginRequest().finally(() => setLoading(false)), {
      loading: "Yuklanmoqda...",
      success: "Xush kelibsiz!",
      error: (err) => err?.message || "Kirishda xatolik",
    });
  };

  const emailHasError = touched.email && errors.email;
  const passwordHasError = touched.password && errors.password;

  return (
    <div className="relative h-screen overflow-hidden bg-transparent">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(105,167,255,0.2),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />

      <div className="relative z-10 grid h-screen xl:grid-cols-[1.15fr_0.85fr]">
        <LeftSlider />

        {/* ── RIGHT PANEL ── */}
        <section className="relative flex h-screen items-center justify-center overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
          <div className="absolute inset-0 xl:bg-[linear-gradient(270deg,rgba(2,7,17,0.84),rgba(2,7,17,0.62),transparent)]" />

          <div className="relative z-10 w-full max-w-[420px]">

            {/* Mobile brand header */}
            <div className="mb-6 flex items-center gap-3 xl:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.08] backdrop-blur-xl">
                <img src="/ProHomeLogo.png" alt="Pro Home CRM" className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Pro Home CRM
                </p>
                <p className="mt-0.5 text-sm text-slate-300">Boshqaruv paneliga kirish</p>
              </div>
            </div>

            {/* Card */}
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl">

              {/* 1. Logo */}
              <div className="mb-5 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-[0_12px_40px_rgba(56,189,248,0.18)] backdrop-blur-xl">
                  <img src="/ProHomeLogo.png" alt="Pro Home CRM" className="h-12 w-12" />
                </div>
              </div>

              {/* 2. Title */}
              <div className="mb-5 text-center">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-sky-400">
                  Pro Home CRM
                </p>
                <h1 className="text-2xl font-semibold leading-snug text-white">
                  Hisobingizga kiring
                </h1>
              </div>

              {/* 3. Animation */}
              <div className="mb-4 flex justify-center">
                <div className="w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                  <DotLottieReact
                    src="/login.json"
                    loop
                    autoplay
                    style={{ width: "100%", height: 140 }}
                  />
                </div>
              </div>

              {/* 4. Description */}
              <p className="mb-6 px-2 text-center text-sm leading-6 text-slate-400">
                Email va parolingizni kiriting. Tizim sizni rolga mos sahifaga yo&apos;naltiradi.
              </p>

              {/* 5. Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-slate-300"
                    htmlFor="email"
                  >
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    aria-invalid={emailHasError ? "true" : "false"}
                    className={`h-11 rounded-xl px-4 text-sm bg-white/[0.05] border-white/10 text-white placeholder:text-slate-500 focus:border-sky-500/60 transition-colors ${
                      emailHasError
                        ? "border-rose-400/70 bg-rose-500/10 placeholder:text-rose-200/50"
                        : ""
                    }`}
                  />
                  <FieldError message={emailHasError ? errors.email : ""} />
                </div>

                {/* Password */}
                <div>
                  <label
                    className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-slate-300"
                    htmlFor="password"
                  >
                    <LockKeyhole className="h-3.5 w-3.5 text-slate-400" />
                    Parol
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Parolingizni kiriting"
                      value={password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      aria-invalid={passwordHasError ? "true" : "false"}
                      className={`h-11 rounded-xl px-4 pr-11 text-sm bg-white/[0.05] border-white/10 text-white placeholder:text-slate-500 focus:border-sky-500/60 transition-colors ${
                        passwordHasError
                          ? "border-rose-400/70 bg-rose-500/10 placeholder:text-rose-200/50"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                      aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <FieldError message={passwordHasError ? errors.password : ""} />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-11 w-full rounded-xl bg-sky-500 text-sm font-semibold text-slate-950 shadow-[0_12px_32px_rgba(56,189,248,0.25)] transition hover:bg-sky-400 active:scale-[0.98] disabled:bg-sky-500/60"
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