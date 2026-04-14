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
import { removeDeviceToken } from "@/services/notificationService";
import { apiUrl, imageUrl } from "@/lib/api";
const LANGUAGES = ["Русский", "O'zbek", "English"];

// ─── helpers ────────────────────────────────────────────────────────────────

function getImageUrl(imgName) {
  return imageUrl(imgName);
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
  const res = await fetch(apiUrl("user/update-me"), {
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

  const res = await fetch(apiUrl("auth/reset-password"), {
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
      className="ml-2 text-gray-500 transition-colors hover:text-gray-300"
    >
      {ok ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
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
    <div ref={ref} className="relative w-full max-w-[18rem]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded border border-[#253d52] bg-[#1a2e40] px-3 py-2 text-sm text-[#c8dce8] transition-colors hover:border-[#3a5570] focus:outline-none"
      >
        {value}
        <ChevronDown
          size={14}
          className={`text-[#7a9ab5] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-30 mt-1 w-full overflow-hidden rounded border border-[#253d52] bg-[#1a2e40] shadow-2xl">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              onClick={() => {
                onChange(l);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                l === value ? "text-blue-400" : "text-[#c8dce8]"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="mb-2 flex min-h-11 flex-col items-start gap-2 sm:mb-0.5 sm:flex-row sm:gap-0">
      <div className="w-full shrink-0 pt-0 sm:w-44 sm:pt-2.5">
        <span className="text-sm text-[#7a9ab5]">{label}</span>
      </div>
      <div className="flex w-full items-center pt-0 sm:pt-1.5">{children}</div>
    </div>
  );
}

function ReadonlyValue({ value }) {
  return (
    <span className="text-sm text-[#c8dce8]">
      {value !== null && value !== undefined && value !== ""
        ? String(value)
        : "—"}
    </span>
  );
}

function TInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-[18rem] rounded border border-[#253d52] bg-[#1a2e40] px-3 py-2 text-sm text-[#c8dce8] placeholder-[#3a5570] transition-colors outline-none focus:border-blue-500"
    />
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  show,
  onToggleVisibility,
}) {
  return (
    <div className="relative w-full max-w-[18rem]">
      <input
        type={show ? "text" : "password"}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-[#253d52] bg-[#1a2e40] px-3 py-2 pr-10 text-sm text-[#c8dce8] placeholder-[#3a5570] transition-colors outline-none focus:border-blue-500"
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-[#7a9ab5] transition-colors hover:text-[#c8dce8]"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function Profile() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
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
    setError(null);
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
      }

      // saqlangandan keyin initial ni yangilaymiz — button yana "Сохранить" bo'ladi
      setInitialForm({ ...form });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError("Saqlashda xato: " + err.message);
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
    } catch (err) {
      setPasswordError("Parolni yangilashda xato: " + err.message);
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

  // button holati
  const btnLabel = saving
    ? "Сохраняется..."
    : saved
      ? "Сохранено ✓"
      : isDirty
        ? "Сохранить •"
        : "Сохранить";

  const btnClass = `flex items-center gap-2 rounded border px-5 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
    isDirty && !saving
      ? "border-blue-500 bg-blue-600 text-white hover:bg-blue-500"
      : "border-[#2a4560] bg-[#1a2e40] text-[#9ab8cc] hover:border-[#3a5570]"
  }`;
  const passwordBtnLabel = passwordSaving
    ? "Обновляется..."
    : passwordSaved
      ? "Обновлено ✓"
      : "Обновить пароль";
  const passwordBtnClass =
    "flex items-center gap-2 rounded border border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div
      className="mx-auto min-h-screen bg-[#0d1e2e] text-white"
      style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
    >
      {/* Header */}
      <div className="mx-auto flex max-w-3xl flex-col gap-3 border-b border-[#162840] bg-[#0d1e2e] px-4 py-3.5 sm:px-6 md:flex-row md:items-center md:justify-between">
        <span className="text-[15px] font-medium text-[#c0d8e8]">
          Настройки профиля
        </span>
        <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center md:w-auto">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/16 hover:text-red-200"
          >
            <LogOut size={14} />
            Logout
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={btnClass}
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            {btnLabel}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-auto max-w-3xl px-4 pt-4 sm:px-6">
          <div className="rounded border border-red-800/50 bg-red-900/20 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <div className="rounded-md border border-[#162840] bg-[#0f2030] p-4 sm:p-7">
          <div className="flex flex-col gap-6 sm:gap-9 md:flex-row">
            {/* Avatar */}
            <div className="shrink-0 self-center md:self-start">
              <div className="relative h-24 w-24">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center overflow-hidden rounded-full text-4xl font-black text-white"
                    style={{
                      background: "linear-gradient(145deg,#7a3810,#a04a20)",
                    }}
                  >
                    {avatarLetter}
                  </div>
                )}
                <label className="absolute right-1 bottom-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#2a4560] bg-[#1a2e40] transition-colors hover:bg-[#243d54]">
                  <Camera size={13} className="text-[#7a9ab5]" />
                  <input
                    type="file"
                    accept="image/jpg,image/png,image/jpeg,image/gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>

            {/* Fields */}
            <div className="min-w-0 flex-1">
              {/* ── Readonly ── */}
              <Row label="ID">
                <ReadonlyValue value={info.id} />
                {info.id !== "" && <CopyBtn value={info.id} />}
              </Row>
              <Row label="Company ID">
                <ReadonlyValue value={info.companyId} />
                {info.companyId !== "" && <CopyBtn value={info.companyId} />}
              </Row>
              <Row label="Role">
                {info.role ? (
                  <span className="rounded bg-[#1a3a50] px-2 py-0.5 text-xs font-semibold tracking-wide text-blue-300">
                    {info.role}
                  </span>
                ) : (
                  <ReadonlyValue value={null} />
                )}
              </Row>
              <Row label="Создан">
                <ReadonlyValue value={formatDate(info.createdAt)} />
              </Row>
              <Row label="Обновлён">
                <ReadonlyValue value={formatDate(info.updatedAt)} />
              </Row>

              {/* ── Divider ── */}
              <div className="my-3 border-t border-[#162840]" />

              {/* ── Editable ── */}
              <Row label="Полное имя">
                <TInput
                  value={form.fullName}
                  onChange={set("fullName")}
                  placeholder="Введите имя"
                />
              </Row>
              <Row label="Email">
                <TInput
                  value={form.email}
                  onChange={set("email")}
                  placeholder="email@example.com"
                  type="email"
                />
              </Row>
              <Row label="Language / Язык">
                <LangSelect value={form.language} onChange={set("language")} />
              </Row>

              {/* ── Divider ── */}
              <div className="my-4 border-t border-[#162840]" />

              {/* ── Password ── */}
              <Row label="Аккаунт email">
                <ReadonlyValue value={accountEmail} />
              </Row>
              <Row label="Текущий пароль">
                <PasswordInput
                  value={passwordForm.oldPassword}
                  onChange={setPasswordField("oldPassword")}
                  placeholder="Введите текущий пароль"
                  show={showPasswords.oldPassword}
                  onToggleVisibility={() =>
                    togglePasswordVisibility("oldPassword")
                  }
                />
              </Row>
              <Row label="Новый пароль">
                <PasswordInput
                  value={passwordForm.newPassword}
                  onChange={setPasswordField("newPassword")}
                  placeholder="Введите новый пароль"
                  show={showPasswords.newPassword}
                  onToggleVisibility={() =>
                    togglePasswordVisibility("newPassword")
                  }
                />
              </Row>
              <Row label="Подтверждение">
                <PasswordInput
                  value={passwordForm.confirmPassword}
                  onChange={setPasswordField("confirmPassword")}
                  placeholder="Повторите новый пароль"
                  show={showPasswords.confirmPassword}
                  onToggleVisibility={() =>
                    togglePasswordVisibility("confirmPassword")
                  }
                />
              </Row>
              <div className="mt-3 sm:ml-44">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={passwordSaving}
                  className={passwordBtnClass}
                >
                  {passwordSaving && <Loader2 size={13} className="animate-spin" />}
                  {passwordBtnLabel}
                </button>
              </div>
              {passwordError && (
                <div className="mt-2 rounded border border-red-800/50 bg-red-900/20 px-3 py-2 text-sm text-red-400 sm:ml-44">
                  {passwordError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
