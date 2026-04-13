import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import FieldError from "@/components/login/FieldError";

export default function LoginEmailField({
  email,
  handleChange,
  handleBlur,
  emailHasError,
  errors,
}) {
  return (
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
  );
}
