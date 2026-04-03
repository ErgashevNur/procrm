import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_VITE_API_KEY_PROHOME;

const initialForm = {
  name: "",
  managerName: "",
  phoneNumber: "",
  email: "",
  password: "",
  description: "",
  logo: null,
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

  const logoName = useMemo(() => form.logo?.name || "", [form.logo]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Kompaniya nomini kiriting";
    if (!form.managerName.trim()) {
      nextErrors.managerName = "Manager ismini kiriting";
    }
    if (!form.phoneNumber.trim()) {
      nextErrors.phoneNumber = "Telefon raqam kiriting";
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Email noto'g'ri";
    }

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
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("managerName", form.managerName.trim());
      formData.append("phoneNumber", form.phoneNumber.trim());

      if (form.email.trim()) formData.append("email", form.email.trim());
      if (form.password.trim()) formData.append("password", form.password);
      if (form.description.trim()) {
        formData.append("description", form.description.trim());
      }

      formData.append("permissions", "CRM");

      if (form.logo instanceof File) {
        formData.append("logo", form.logo);
      }

      const response = await fetch(`${API_BASE}/company/public`, {
        method: "POST",
        body: formData,
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

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top, rgba(14,165,233,.12), transparent 25%), #070b12",
        color: "#fff",
        padding: "20px",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            marginBottom: 24,
            border: "1px solid rgba(255,255,255,.08)",
            background: "transparent",
            color: "rgba(255,255,255,.72)",
            borderRadius: 10,
            padding: "10px 16px",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← Orqaga
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "rgba(11,16,24,.9)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 24,
              padding: 32,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(14,165,233,.1)",
                border: "1px solid rgba(14,165,233,.2)",
                color: "#38bdf8",
                fontSize: 12,
                marginBottom: 18,
              }}
            >
              Public Register
            </div>

            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 3.3rem)",
                lineHeight: 1.05,
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              Kompaniyangizni
              <br />
              tizimga ulang
            </h1>

            <p
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: "rgba(255,255,255,.55)",
                marginBottom: 28,
                maxWidth: 520,
              }}
            >
              Siz bergan `company/public` endpointiga mos ro'yxatdan o'tish formasi.
              Kompaniya ma'lumotlari, manager, permission va logo shu sahifadan yuboriladi.
            </p>

            <div style={{ display: "grid", gap: 14 }}>
              {[
                "Kompaniya nomi va manager ma'lumoti",
                "Telefon, email va password yuborish",
                "Permission avtomatik CRM sifatida yuboriladi",
                "Logo bilan multipart/form-data jo'natish",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: 14,
                    background: "#0f1724",
                    border: "1px solid rgba(255,255,255,.06)",
                    color: "rgba(255,255,255,.78)",
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              background: "rgba(11,16,24,.96)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 24,
              padding: 32,
            }}
          >
            <div style={{ display: "grid", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 8 }}>
                  Kompaniya nomi *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="ABC Group"
                  style={inputStyle("name")}
                />
                {errors.name && <p style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>{errors.name}</p>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 8 }}>
                  Manager ismi *
                </label>
                <input
                  value={form.managerName}
                  onChange={(e) => setField("managerName", e.target.value)}
                  placeholder="Ali Valiyev"
                  style={inputStyle("managerName")}
                />
                {errors.managerName && (
                  <p style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>{errors.managerName}</p>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 8 }}>
                  Telefon raqam *
                </label>
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setField("phoneNumber", e.target.value)}
                  placeholder="+998901234567"
                  style={inputStyle("phoneNumber")}
                />
                {errors.phoneNumber && (
                  <p style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>{errors.phoneNumber}</p>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 8 }}>
                  Email
                </label>
                <input
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="company@mail.com"
                  style={inputStyle("email")}
                />
                {errors.email && <p style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>{errors.email}</p>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 8 }}>
                  Parol
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="Parol kiriting"
                  style={inputStyle("password")}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 8 }}>
                  Tavsif
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Qurilish kompaniyasi"
                  style={{
                    ...inputStyle("description"),
                    minHeight: 110,
                    padding: "14px",
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 8 }}>
                  Logo
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    minHeight: 52,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,.08)",
                    background: "#0f1724",
                    padding: "0 14px",
                    cursor: "pointer",
                    color: logoName ? "#fff" : "rgba(255,255,255,.45)",
                    fontSize: 14,
                  }}
                >
                  <span>{logoName || "Fayl tanlang"}</span>
                  <span style={{ color: "#38bdf8" }}>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setField("logo", e.target.files?.[0] || null)}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  height: 48,
                  borderRadius: 12,
                  border: "none",
                  background: "#0ea5e9",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
