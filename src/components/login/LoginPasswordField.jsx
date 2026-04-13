import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Input } from "@/components/ui/input";
import FieldError from "@/components/login/FieldError";

export default function LoginPasswordField({
  showPassword,
  setShowPassword,
  password,
  handleChange,
  handleBlur,
  passwordHasError,
  errors,
}) {
  return (
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
  );
}
