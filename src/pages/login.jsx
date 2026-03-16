import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Eye, EyeOff, House, LockKeyhole, Mail } from "lucide-react";
import { getDefaultRouteByRole, isSupportedRole } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <aside className="relative hidden min-h-screen flex-1 overflow-hidden xl:flex">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(105,167,255,0.28),transparent_38%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.1),transparent_26%),linear-gradient(160deg,rgba(2,8,18,0.98),rgba(5,15,28,0.96))]" />
      <div className="absolute inset-y-10 left-10 right-20 rounded-[36px] border border-white/10 bg-white/[0.03]" />

      <div className="relative z-10 flex w-full flex-col justify-between px-10 py-10 2xl:px-14">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <img src="/ProHomeLogo.png" alt="Pro Home CRM" className="h-9 w-9" />
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.28em] text-slate-400 uppercase">
              Pro Home CRM
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              Savdo bo&apos;limi uchun yagona ish maydoni
            </h2>
          </div>
        </div>

        <div
          className="flex flex-1 flex-col justify-center transition-all duration-300"
          style={{
            opacity: visible ? 1 : 0.28,
            transform: visible ? "translateY(0)" : "translateY(10px)",
          }}
        >
          <div className="mb-8 flex max-w-xl items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 backdrop-blur-xl">
            <span className="inline-flex rounded-full bg-sky-400/15 px-2.5 py-1 text-[11px] font-semibold tracking-[0.24em] text-sky-300 uppercase">
              {slide.stat}
            </span>
            <span>Tizimga kirganingizdan keyin barcha jarayonlar shu yerdan boshlanadi.</span>
          </div>

          <div className="grid items-center gap-12 2xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="max-w-xl">
              <h3 className="text-5xl leading-tight font-semibold text-white">
                {slide.title}
              </h3>
              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
                {slide.desc}
              </p>

              <div className="mt-10 grid max-w-lg gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                  <p className="text-3xl font-semibold text-white">3+</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Sotuv, lead va loyiha oqimini bitta panelda kuzatish.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                  <p className="text-3xl font-semibold text-white">1 ta</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Jamoa uchun umumiy ish maydoni va real vaqt holati.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="rounded-[32px] border border-white/12 bg-white/[0.04] p-6 shadow-[0_22px_80px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
                <DotLottieReact
                  key={current}
                  src={slide.src}
                  loop
                  autoplay
                  style={{ width: 320, height: 320 }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
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

          <p className="max-w-xs text-right text-sm leading-6 text-slate-400">
            CRM ichidagi barcha asosiy jarayonlar login bilan boshlanadi.
          </p>
        </div>
      </div>
    </aside>
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

function FieldError({ message }) {
  if (!message) return null;

  return <p className="mt-2 text-xs text-rose-300">{message}</p>;
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
    <div className="relative min-h-screen overflow-hidden bg-transparent">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(105,167,255,0.2),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />

      <div className="relative z-10 grid min-h-screen xl:grid-cols-[1.15fr_0.85fr]">
        <LeftSlider />

        <section className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="absolute inset-0 xl:bg-[linear-gradient(270deg,rgba(2,7,17,0.84),rgba(2,7,17,0.62),transparent)]" />

          <div className="relative z-10 w-full max-w-[480px]">
            <div className="mb-6 flex items-center gap-3 xl:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/8 backdrop-blur-xl">
                <img src="/ProHomeLogo.png" alt="Pro Home CRM" className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.24em] text-slate-400 uppercase">
                  Pro Home CRM
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Boshqaruv paneliga kirish
                </p>
              </div>
            </div>

            <div className="crm-card crm-hairline rounded-[32px] p-5 sm:p-7 md:p-8">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="crm-kicker">Login</p>
                  <h1 className="mt-3 text-3xl font-semibold text-white">
                    Hisobingizga kiring
                  </h1>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
                    Email va parolingizni kiriting. Tizim sizni rolga mos sahifaga yo&apos;naltiradi.
                  </p>
                </div>

                <div className="hidden rounded-2xl border border-sky-400/20 bg-sky-400/10 p-3 text-sky-300 sm:block">
                  <House className="h-5 w-5" />
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label
                    className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-200"
                    htmlFor="email"
                  >
                    <Mail className="h-4 w-4 text-slate-400" />
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
                    className={`h-12 rounded-2xl px-4 ${
                      emailHasError
                        ? "border-rose-400/70 bg-rose-500/10 text-white placeholder:text-rose-200/60"
                        : ""
                    }`}
                  />
                  <FieldError message={emailHasError ? errors.email : ""} />
                </div>

                <div>
                  <label
                    className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-200"
                    htmlFor="password"
                  >
                    <LockKeyhole className="h-4 w-4 text-slate-400" />
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
                      className={`h-12 rounded-2xl px-4 pr-12 ${
                        passwordHasError
                          ? "border-rose-400/70 bg-rose-500/10 text-white placeholder:text-rose-200/60"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center justify-center text-slate-400 transition-colors hover:text-white"
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

                <div className="grid gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-400 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                      Xavfsizlik
                    </p>
                    <p className="mt-2 leading-6">
                      Sessiya rol va token asosida saqlanadi.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                      Yo&apos;naltirish
                    </p>
                    <p className="mt-2 leading-6">
                      Kirgandan keyin birinchi loyiha avtomatik tanlanadi.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-2xl bg-sky-500 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(56,189,248,0.28)] transition hover:bg-sky-400 disabled:bg-sky-500/70"
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
