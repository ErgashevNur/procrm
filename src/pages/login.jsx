import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Eye, EyeOff, House, LockKeyhole, Mail } from "lucide-react";
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
    stat: "Leadlar nazorati",
  },
  {
    src: "/analitic.json",
    title: "Raqamlar qarorni tezlashtiradi",
    desc: "Real vaqt analitikasi bilan savdo jarayonidagi o'sish nuqtalarini darhol ko'rasiz.",
    stat: "Jonli hisobotlar!.",
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
    <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden border-r border-white/[0.06] bg-[#080c14] px-12 py-10 xl:flex">
      {/* subtle top-left glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-sky-500/[0.07] blur-[96px]" />

      {/* Brand */}
      <div className="relative z-10 flex flex-col items-center gap-1 text-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
          <img src="/ProHomeLogo.png" alt="Pro Home CRM" className="h-5 w-5" />
        </div>
        <span className="text-[11px] font-semibold tracking-[0.26em] text-white/40 uppercase">
          Kotibam
        </span>
      </div>

      {/* Slide content */}
      <div
        className="relative z-10 flex flex-1 flex-col items-center justify-center text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.42s ease, transform 0.42s ease",
        }}
      >
        {/* Badge */}
        <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          <span className="text-[11px] font-medium tracking-[0.18em] text-sky-400/90 uppercase">
            {slide.stat}
          </span>
        </div>

        {/* Lottie */}
        <div className="mb-10 flex w-full justify-center">
          <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-5">
            <DotLottieReact
              key={current}
              src={slide.src}
              loop
              autoplay
              style={{ width: 260, height: 260 }}
            />
          </div>
        </div>

        {/* Title + desc */}
        <h3 className="mb-4 max-w-sm text-[28px] leading-[1.25] font-semibold tracking-[-0.02em] text-white">
          {slide.title}
        </h3>
        <p className="max-w-xs text-sm leading-7 text-white/38">{slide.desc}</p>
      </div>

      {/* Dots */}
      <div className="relative z-10 flex items-center justify-center gap-2">
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
            className={`h-[3px] rounded-full transition-all duration-300 ${
              index === current
                ? "w-8 bg-sky-400"
                : "w-3 bg-white/15 hover:bg-white/30"
            }`}
            aria-label={`${index + 1}-slayd`}
          />
        ))}
      </div>
    </aside>
  );
}

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

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-2 text-[11px] text-rose-400/90">{message}</p>;
}

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
            <div className="mb-8 flex items-center gap-3 xl:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                <img
                  src="/ProHomeLogo.png"
                  alt="Pro Home CRM"
                  className="h-5 w-5"
                />
              </div>
              <span className="text-[11px] font-semibold tracking-[0.26em] text-white/40 uppercase">
                Kotibam
              </span>
            </div>

            {/* Card */}
            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-sm sm:p-8">
              {/* Header */}
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-3 text-[10px] font-semibold tracking-[0.28em] text-sky-400/80 uppercase">
                    Tizimga kirish
                  </p>
                  <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.02em] text-white">
                    Hisobingizga kiring!
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-white/38">
                    Email va parolingizni kiriting.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] text-white/40 uppercase"
                  >
                    <Mail className="h-3.5 w-3.5" />
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
                    className={`h-11 rounded-xl border bg-white/[0.04] px-4 text-sm text-white transition-colors placeholder:text-white/20 focus:ring-0 focus-visible:ring-0 ${
                      emailHasError
                        ? "border-rose-500/50 bg-rose-500/[0.06]"
                        : "border-white/[0.08] focus:border-sky-500/50"
                    }`}
                  />
                  <FieldError message={emailHasError ? errors.email : ""} />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] text-white/40 uppercase"
                  >
                    <LockKeyhole className="h-3.5 w-3.5" />
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
                      className={`h-11 rounded-xl border bg-white/[0.04] px-4 pr-11 text-sm text-white transition-colors placeholder:text-white/20 focus:ring-0 focus-visible:ring-0 ${
                        passwordHasError
                          ? "border-rose-500/50 bg-rose-500/[0.06]"
                          : "border-white/[0.08] focus:border-sky-500/50"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute top-1/2 right-3.5 -translate-y-1/2 text-white/25 transition-colors hover:text-white/60"
                      aria-label={
                        showPassword
                          ? "Parolni yashirish"
                          : "Parolni ko'rsatish"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <FieldError
                    message={passwordHasError ? errors.password : ""}
                  />
                </div>

                {/* Info grid */}
                <div className="grid gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold tracking-[0.2em] text-white/25 uppercase">
                      Xavfsizlik
                    </p>
                    <p className="text-xs leading-5 text-white/35">
                      Sessiya rol va token asosida saqlanadi.
                    </p>
                  </div>
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold tracking-[0.2em] text-white/25 uppercase">
                      Yo&apos;naltirish
                    </p>
                    <p className="text-xs leading-5 text-white/35">
                      Kirgandan keyin loyiha avtomatik tanlanadi.
                    </p>
                  </div>
                </div>

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
