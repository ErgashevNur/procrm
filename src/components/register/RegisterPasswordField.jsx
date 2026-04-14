import { Eye, EyeOff } from "lucide-react";
import RegisterFieldError from "@/components/register/RegisterFieldError";

export default function RegisterPasswordField({
  showPassword,
  setShowPassword,
  value,
  onChange,
  style,
  error,
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, marginBottom: 8 }}>
        Parol *
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="Parol kiriting"
          style={{ ...style, paddingRight: 44 }}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
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
      <RegisterFieldError message={error} />
    </div>
  );
}
