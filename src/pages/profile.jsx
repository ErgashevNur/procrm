import { useState, useEffect, useRef } from "react";
import {
  Copy,
  Check,
  Camera,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
} from "lucide-react";
import { emitAuthChange } from "@/hooks/useNotification";
import { useUser } from "@/context/UserContext";
import { removeDeviceToken } from "@/services/notificationService";
import { toast } from "@/lib/toast";

const API_BASE = import.meta.env.VITE_VITE_API_KEY_PROHOME;
const LANGUAGES = ["Русский", "O'zbek", "English"];

// ─── helpers ────────────────────────────────────────────────────────────────

function getImageUrl(imgName) {
  if (!imgName) return null;
  if (imgName.startsWith("blob:") || imgName.startsWith("http")) return imgName;
  return `${API_BASE}/image/${imgName}`;
}

function getToken() {
  return localStorage.getItem("user") ?? null;
}

function getUserFromStorage() {
  try {
    const raw = localStorage.getItem("userData");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user ?? null;
  } catch {
    return null;
  }
}

function updateUserInStorage(updatedFields) {
  try {
    const raw = localStorage.getItem("userData");
    const parsed = raw ? JSON.parse(raw) : {};
    parsed.user = { ...(parsed.user ?? {}), ...updatedFields };
    localStorage.setItem("userData", JSON.stringify(parsed));
  } catch {}
}

async function patchProfile(formData) {
  const res = await fetch(`${API_BASE}/user/update-me`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getResponseMessage(payload) {
  if (!payload) return "";
  if (typeof payload.message === "string") return payload.message;
  if (Array.isArray(payload.message)) return payload.message.join(", ");
  if (typeof payload.error === "string") return payload.error;
  return "";
}

async function resetPassword(payload) {
  const token = getToken();
  const headers = {
    accept: "*/*",
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new Error(getResponseMessage(data) || `HTTP ${res.status}`);
  }

  return data;
}

// ─── sub-components ─────────────────────────────────────────────────────────

function CopyBtn({ value }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(String(value));
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
      className="ml-1.5 text-[#4a6a85] transition-colors hover:text-[#69a7ff]"
    >
      {ok ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
    </button>
  );
}

function LangSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-[#071828] px-3 py-2.5 text-sm text-white transition-all hover:border-white/20 focus:border-blue-500/50 focus:outline-none"
      >
        {value}
        <ChevronDown size={14} className={`text-[#69a7ff] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-30 mt-1 w-full overflow-hidden rounded-xl border border-white/[0.07] bg-[#071828] shadow-2xl">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              onClick={() => { onChange(l); setOpen(false); }}
              className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/5 ${l === value ? "text-[#69a7ff]" : "text-[#c8dce8]"}`}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/[0.07] bg-[#071828] px-3 py-2.5 text-sm text-white placeholder-gray-600 transition-all outline-none focus:border-blue-500/50"
    />
  );
}

function PasswordInput({ value, onChange, placeholder, show, onToggleVisibility }) {
  return (
    <div className="relative w-full">
      <input
        type={show ? "text" : "password"}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/[0.07] bg-[#071828] px-3 py-2.5 pr-10 text-sm text-white placeholder-gray-600 transition-all outline-none focus:border-blue-500/50"
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-600 transition-colors hover:text-blue-400"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p className="mb-4 text-[11px] font-semibold tracking-widest text-[#69a7ff] uppercase">
      {children}
    </p>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-1 text-sm text-[#c0d8e8]">{children}</div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function Profile() {
  const { updateUser } = useUser();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // readonly — o'zgartirib bo'lmaydi
  const [info, setInfo] = useState({
    id: "",
    companyId: "",
    role: "",
    createdAt: "",
    updatedAt: "",
  });

  // editable — PATCH ga yuboriladigan fieldlar
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    language: "Русский",
  });

  // dirty tracking uchun initial qiymatlar
  const [initialForm, setInitialForm] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // o'zgarish bormi?
  const isDirty =
    initialForm !== null &&
    (JSON.stringify(form) !== JSON.stringify(initialForm) ||
      avatarFile !== null);

  // ── localStorage dan yuklash ──────────────────────────────────────────────
  useEffect(() => {
    const user = getUserFromStorage();
    if (!user) return;

    setInfo({
      id: user.id ?? "",
      companyId: user.companyId ?? "",
      role: user.role ?? "",
      createdAt: user.createdAt ?? "",
      updatedAt: user.updatedAt ?? "",
    });

    const loaded = {
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      language: "Русский",
    };

    setForm(loaded);
    setAccountEmail(user.email ?? "");
    setInitialForm(loaded); // dirty tracking uchun initial saqlash

    if (user.img) setAvatarPreview(getImageUrl(user.img));
  }, []);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setPasswordField = (k) => (v) =>
    setPasswordForm((f) => ({ ...f, [k]: v }));
  const togglePasswordVisibility = (k) =>
    setShowPasswords((prev) => ({ ...prev, [k]: !prev[k] }));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!isDirty) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("fullName", form.fullName);
      fd.append("email", form.email);
      if (avatarFile) fd.append("img", avatarFile);

      const result = await patchProfile(fd);
      const updated = result?.data;

      if (updated) {
        setInfo({
          id: updated.id ?? info.id,
          companyId: updated.companyId ?? info.companyId,
          role: updated.role ?? info.role,
          createdAt: updated.createdAt ?? info.createdAt,
          updatedAt: updated.updatedAt ?? info.updatedAt,
        });

        if (updated.img) {
          setAvatarPreview(getImageUrl(updated.img));
          setAvatarFile(null);
        }

        if (typeof updated.email === "string") setAccountEmail(updated.email);
        updateUserInStorage(updated);
        updateUser(updated);
      }

      // saqlangandan keyin initial ni yangilaymiz — button yana "Сохранить" bo'ladi
      setInitialForm({ ...form });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success("Profil saqlandi");
    } catch (err) {
      toast.error("Saqlashda xato: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const validatePasswordForm = () => {
    if (!accountEmail.trim()) return "Email topilmadi, qayta login qiling";
    if (!passwordForm.oldPassword.trim()) return "Joriy parolni kiriting";
    if (!passwordForm.newPassword.trim()) return "Yangi parolni kiriting";
    if (passwordForm.newPassword.length < 6)
      return "Yangi parol kamida 6 belgidan iborat bo'lishi kerak";
    if (passwordForm.oldPassword === passwordForm.newPassword)
      return "Yangi parol joriy paroldan farq qilishi kerak";
    if (!passwordForm.confirmPassword.trim())
      return "Yangi parol tasdig'ini kiriting";
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return "Yangi parol va tasdiq bir xil emas";
    return "";
  };

  const handlePasswordReset = async () => {
    if (passwordSaving) return;

    setPasswordError(null);
    const validationError = validatePasswordForm();
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    setPasswordSaving(true);
    try {
      await resetPassword({
        email: accountEmail.trim(),
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswords({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
      });

      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
      toast.success("Parol muvaffaqiyatli yangilandi");
    } catch (err) {
      setPasswordError("Parolni yangilashda xato: " + err.message);
      toast.error("Parolni yangilashda xato: " + err.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await removeDeviceToken();
    } catch (error) {
      console.error("Device tokenni o'chirishda xato:", error);
    } finally {
      localStorage.clear();
      emitAuthChange();
      window.location.href = "/login";
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const avatarLetter = (form.fullName || form.email || "U")[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[#071828] font-[Segoe_UI,sans-serif] text-white">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-2 sticky top-0 z-10 border-b border-white/[0.06] bg-[#071828]/90 px-6 py-4 backdrop-blur duration-300">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <h1 className="text-lg font-bold text-white">Profil sozlamalari</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/15 hover:text-red-300"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all disabled:opacity-40 ${
                isDirty && !saving
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:opacity-90"
                  : "border border-white/[0.08] bg-[#0a1929] text-gray-500"
              }`}
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              {saving ? "Saqlanmoqda..." : saved ? "Saqlandi ✓" : "Saqlash"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-4 p-6">
        {/* Avatar card */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0a1929] p-5">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="h-18 w-18 overflow-hidden rounded-2xl">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="flex h-18 w-18 items-center justify-center text-2xl font-black text-white"
                    style={{ background: "linear-gradient(145deg,#1a4080,#2558b0)" }}
                  >
                    {avatarLetter}
                  </div>
                )}
              </div>
              <label className="absolute -right-1 -bottom-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl border border-white/[0.08] bg-[#071828] transition-colors hover:border-blue-500/40 hover:bg-[#0d2035]">
                <Camera size={12} className="text-blue-400" />
                <input type="file" accept="image/jpg,image/png,image/jpeg,image/gif" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">{form.fullName || "—"}</p>
              <p className="mt-0.5 truncate text-sm text-gray-500">{accountEmail || form.email || "—"}</p>
              {info.role && (
                <span className="mt-2 inline-block rounded-lg border border-blue-500/20 bg-blue-600/10 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
                  {info.role}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Shaxsiy ma'lumotlar */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0a1929] p-5">
            <SectionTitle>Shaxsiy ma'lumotlar</SectionTitle>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs text-gray-500">To'liq ism</label>
                <ProfileInput value={form.fullName} onChange={set("fullName")} placeholder="Ismingizni kiriting" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-gray-500">Email</label>
                <ProfileInput value={form.email} onChange={set("email")} placeholder="email@example.com" type="email" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-gray-500">Til</label>
                <LangSelect value={form.language} onChange={set("language")} />
              </div>
            </div>
          </div>

          {/* Tizim ma'lumotlari */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0a1929] p-5">
            <SectionTitle>Tizim ma'lumotlari</SectionTitle>
            <InfoRow label="ID">
              {info.id || "—"}
              {info.id && <CopyBtn value={info.id} />}
            </InfoRow>
            <InfoRow label="Kompaniya ID">
              {info.companyId || "—"}
              {info.companyId && <CopyBtn value={info.companyId} />}
            </InfoRow>
            <InfoRow label="Rol">
              {info.role ? (
                <span className="rounded-lg bg-blue-600/10 px-2 py-0.5 text-xs font-semibold text-blue-300">{info.role}</span>
              ) : "—"}
            </InfoRow>
            <InfoRow label="Yaratilgan">{formatDate(info.createdAt)}</InfoRow>
            <InfoRow label="Yangilangan">{formatDate(info.updatedAt)}</InfoRow>
          </div>
        </div>

        {/* Parol */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0a1929] p-5">
          <SectionTitle>Parolni yangilash</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs text-gray-500">Joriy parol</label>
              <PasswordInput
                value={passwordForm.oldPassword}
                onChange={setPasswordField("oldPassword")}
                placeholder="Joriy parol"
                show={showPasswords.oldPassword}
                onToggleVisibility={() => togglePasswordVisibility("oldPassword")}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-gray-500">Yangi parol</label>
              <PasswordInput
                value={passwordForm.newPassword}
                onChange={setPasswordField("newPassword")}
                placeholder="Yangi parol"
                show={showPasswords.newPassword}
                onToggleVisibility={() => togglePasswordVisibility("newPassword")}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-gray-500">Tasdiqlash</label>
              <PasswordInput
                value={passwordForm.confirmPassword}
                onChange={setPasswordField("confirmPassword")}
                placeholder="Qaytaring"
                show={showPasswords.confirmPassword}
                onToggleVisibility={() => togglePasswordVisibility("confirmPassword")}
              />
            </div>
          </div>
          {passwordError && (
            <p className="mt-3 text-xs text-red-400">{passwordError}</p>
          )}
          <div className="mt-4">
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={passwordSaving}
              className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 transition-all hover:bg-amber-500/15 disabled:opacity-50"
            >
              {passwordSaving && <Loader2 size={13} className="animate-spin" />}
              {passwordSaving ? "Yangilanmoqda..." : passwordSaved ? "Yangilandi ✓" : "Parolni yangilash"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
