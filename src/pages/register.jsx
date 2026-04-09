import { useState } from "react";
import { Eye as EyeIcon, EyeOff as EyeOffIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { getGoogleAuthUrl } from "@/lib/auth";
import { API as API_BASE } from "@/lib/api";
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
  if (Array.isArray(payload?.message)) {
    const joined = payload.message.map((item) => String(item || "").trim()).filter(Boolean).join(", ");
    if (joined) return joined;
  }

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }
  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  return fallback;
}

function mapConflictErrors(message) {
  const normalized = String(message || "").toLowerCase();
  const nextErrors = {};

  if (normalized.includes("telefon")) {
    nextErrors.phoneNumber = "Bu telefon raqam allaqachon ro'yxatdan o'tgan";
  }

  if (normalized.includes("email")) {
    nextErrors.email = "Bu email allaqachon ro'yxatdan o'tgan";
  }

  return nextErrors;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Kompaniya nomini kiriting";
    if (!form.phoneNumber.trim())
      nextErrors.phoneNumber = "Telefon raqam kiriting";
    if (form.phoneNumber.trim() && !/^\+998\d{9}$/.test(form.phoneNumber.trim())) {
      nextErrors.phoneNumber =
        "Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak";
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
      let response;

      try {
        response = await fetch(`${API_BASE}/company/public`, {
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
      } catch (networkError) {
        throw new Error(
          "Backend bilan ulanishda xatolik. Internet, API yoki CORS sozlamasini tekshiring.",
        );
      }

      const payload = await parseJsonSafe(response);

      if (!response.ok) {
        const message = getResponseMessage(
          payload,
          `Ro'yxatdan o'tishda xatolik (HTTP ${response.status})`,
        );

        if (response.status === 409) {
          const conflictErrors = mapConflictErrors(message);
          if (Object.keys(conflictErrors).length > 0) {
            setErrors((prev) => ({ ...prev, ...conflictErrors }));
          }
        }

        throw new Error(message);
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

  const inputClassName = (key) =>
    `min-h-[46px] w-full rounded-xl border bg-[#0f1724] px-[14px] text-sm text-white outline-none transition-colors placeholder:text-white/25 ${
      errors[key]
        ? "border-red-400/70 focus:border-red-400/80"
        : "border-white/[0.08] focus:border-sky-400/70"
    }`;

  return (
    <div className="flex min-h-screen items-center justify-center overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(14,165,233,.12),_transparent_25%),_#070b12] px-4 py-4 font-[Inter,sans-serif] text-white sm:px-5 sm:py-5">
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="grid items-center justify-center gap-4 md:grid-cols-[1.1fr_1fr] md:gap-6">
          <div className="hidden self-center rounded-3xl border border-white/[0.07] bg-[rgba(11,16,24,.9)] p-8 md:block">
            <div className="mb-[18px] inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs text-sky-400">
              Public Register
            </div>

            <h1 className="mb-[14px] text-[clamp(2rem,4vw,3.3rem)] leading-[1.05] font-extrabold">
              Kompaniyangizni
              <br />
              tizimga ulang
            </h1>

            <p className="mb-7 max-w-[520px] text-[15px] leading-[1.8] text-white/55">
              Siz bergan `company/public` endpointiga mos ro'yxatdan o'tish
              formasi. So'rov faqat kerakli maydonlar bilan yuboriladi.
            </p>

            <div className="grid gap-[14px]">
              {[
                "Kompaniya nomi va manager ma'lumoti",
                "Telefon, email va password yuborish",
                "Permission avtomatik CRM sifatida yuboriladi",
                "Logo bilan multipart/form-data jo'natish",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[14px] border border-white/[0.06] bg-[#0f1724] px-4 py-[14px] text-sm text-white/78"
                >
                  <span className="font-bold text-green-500">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[460px] flex-col items-center justify-center md:max-w-[560px] xl:max-w-[520px]">
            <div className="mt-2 mb-4 flex items-center gap-3 self-start xl:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/82 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,.44),rgba(255,255,255,.2)_28%,rgba(255,255,255,.08)_48%,rgba(14,165,233,.18)_72%,rgba(14,165,233,.1)_100%)] shadow-[inset_0_0_10px_rgba(255,255,255,.4),inset_0_0_22px_rgba(255,255,255,.22),inset_0_0_42px_rgba(255,255,255,.12),0_0_18px_rgba(255,255,255,.12)]">
                <img src="/logo.png" alt="Kotibam" className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold tracking-[0.26em] text-white/40 uppercase">
                Kotibam
              </span>
            </div>

            <div className="mb-2 flex w-full xl:hidden">
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
              className="mx-auto w-full max-w-[460px] rounded-[20px] border border-white/[0.07] bg-[rgba(11,16,24,.96)] p-5 md:max-w-[560px] md:rounded-3xl md:p-6 xl:max-w-[520px] xl:p-8"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-3 text-[10px] font-semibold tracking-[0.28em] text-sky-400/80 uppercase">
                    Ro'yxatdan o'tish
                  </p>
                  <h1 className="text-2xl leading-[1.15] font-semibold tracking-[-0.02em] text-white md:text-[26px]">
                    Hisobingizni yarating
                  </h1>
                  <p className="mt-3 text-sm leading-[1.6] text-white/38">
                    Kerakli ma'lumotlarni kiriting va kompaniyangizni ulang.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="hidden xl:inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs leading-none font-medium text-white/70 transition-colors hover:border-white/15 hover:text-white sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs"
                >
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <span aria-hidden="true">←</span>
                    <span>Orqaga</span>
                  </span>
                </button>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-[13px]">
                    Kompaniya nomi *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="ABC Group"
                    className={inputClassName("name")}
                  />
                  {errors.name ? (
                    <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-[13px]">
                    Telefon raqam *
                  </label>
                  <input
                    value={form.phoneNumber}
                    onChange={(e) => setField("phoneNumber", e.target.value)}
                    placeholder="+998901234567"
                    className={inputClassName("phoneNumber")}
                  />
                  {errors.phoneNumber ? (
                    <p className="mt-1.5 text-xs text-red-400">
                      {errors.phoneNumber}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-[13px]">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="company@mail.com"
                    className={inputClassName("email")}
                  />
                  {errors.email ? (
                    <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-[13px]">Parol *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                      placeholder="Parol kiriting"
                      className={`${inputClassName("password")} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword
                          ? "Parolni yashirish"
                          : "Parolni ko'rsatish"
                      }
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-black transition-colors hover:text-black/70"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="mt-1.5 text-xs text-red-400">
                      {errors.password}
                    </p>
                  ) : null}
                </div>


                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 rounded-xl bg-sky-500 text-sm font-semibold text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
                </button>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || submitting}
                  className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#111927] px-4 text-sm font-semibold text-white transition-colors hover:border-white/15 hover:bg-[#162133] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {!googleLoading && (
                    <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border border-white/[0.12] bg-white shadow-[0_2px_10px_rgba(0,0,0,.18)]">
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
                  )}
                  {googleLoading ? (
                    <span className="w-full text-center">Yuklanmoqda...</span>
                  ) : (
                    <>
                      <span className="min-w-[138px] text-center">
                        Google bilan kirish
                      </span>
                      <span className="rounded-full border border-amber-400/30 bg-amber-400/12 px-2 py-0.5 text-[10px] font-bold tracking-[0.16em] text-amber-300 uppercase">
                        Beta
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
