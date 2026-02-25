import { useState, useEffect, useRef } from "react";
import { Copy, Check, Camera, ChevronDown } from "lucide-react";

const LANGUAGES = ["Русский", "O'zbek", "English"];

function CopyBtn({ value }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
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
    <div ref={ref} className="relative w-72">
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
              className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${l === value ? "text-blue-400" : "text-[#c8dce8]"}`}
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
    <div className="mb-0.5 flex min-h-11 items-start">
      <div className="w-40 shrink-0 pt-2.5">
        <span className="text-sm text-[#7a9ab5]">{label}</span>
      </div>
      <div className="flex items-center pt-1.5">{children}</div>
    </div>
  );
}

function TInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-72 rounded border border-[#253d52] bg-[#1a2e40] px-3 py-2 text-sm text-[#c8dce8] placeholder-[#3a5570] transition-colors outline-none focus:border-blue-500"
    />
  );
}

function TTextarea({ value, onChange }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className="w-72 resize-none rounded border border-[#253d52] bg-[#1a2e40] px-3 py-2 text-sm text-[#c8dce8] placeholder-[#3a5570] transition-colors outline-none focus:border-blue-500"
    />
  );
}

function Toggle({ active, onChange }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`relative h-5 w-9 rounded-full border transition-colors duration-200 ${
        active
          ? "border-blue-500 bg-blue-500"
          : "border-[#3a5570] bg-transparent"
      }`}
    >
      <span
        className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all duration-200 ${
          active ? "left-4.5 bg-white" : "left-0.5 bg-[#3a5570]"
        }`}
      />
    </button>
  );
}

export default function Profile() {
  const [saved, setSaved] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [form, setForm] = useState({
    language: "Русский",
    name: "",
    phone: "",
    email: "",
    password: "",
    note: "",
    userId: "12579786",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userData");
      if (raw) {
        const { user = {} } = JSON.parse(raw);
        setForm((f) => ({
          ...f,
          email: user.email || "",
          userId: user.id || user.companyId || f.userId,
          name: user.name || user.email?.split("@")[0] || "",
          phone: user.phone || "",
          note: user.note || "",
        }));
      } else {
        setForm((f) => ({
          ...f,
          email: localStorage.getItem("email") || "",
          userId: localStorage.getItem("companyId") || f.userId,
          name: localStorage.getItem("name") || "",
          phone: localStorage.getItem("phone") || "",
        }));
      }
    } catch {}
  }, []);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    try {
      const raw = localStorage.getItem("userData");
      const parsed = raw ? JSON.parse(raw) : { user: {} };
      parsed.user = {
        ...parsed.user,
        name: form.name,
        phone: form.phone,
        email: form.email,
        note: form.note,
      };
      localStorage.setItem("userData", JSON.stringify(parsed));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const avatarLetter = (form.name || form.email || "Z")[0].toUpperCase();

  return (
    <div
      className="mx-auto min-h-screen bg-[#0d1e2e] text-white"
      style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
    >
      {/* Header */}
      <div className="mx-auto flex max-w-3xl items-center justify-between border-b border-[#162840] bg-[#0d1e2e] px-6 py-3.5">
        <span className="text-[15px] font-medium text-[#c0d8e8]">
          Настройки профиля
        </span>

        <button
          onClick={handleSave}
          className="min-w- ext-sm rounded border border-[#2a4560] bg-[#1a2e40] px-5 py-1.5 font-medium text-[#9ab8cc] transition-colors hover:border-[#3a5570]"
        >
          {saved ? "Сохранено ✓" : "Сохранить"}
        </button>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-3xl p-6">
        {/* Profile Card */}
        <div className="mb-7 rounded-md border border-[#162840] bg-[#0f2030] p-7">
          <div className="flex gap-9">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="relative h-24 w-24">
                <div
                  className="flex h-full w-full items-center justify-center overflow-hidden rounded-full text-4xl font-black text-white"
                  style={{
                    background: "linear-gradient(145deg,#7a3810,#a04a20)",
                  }}
                >
                  {avatarLetter}
                </div>
                <label className="absolute right-1 bottom-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#2a4560] bg-[#1a2e40] transition-colors hover:bg-[#243d54]">
                  <Camera size={13} className="text-[#7a9ab5]" />
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1">
              <Row label="ID пользователя">
                <span className="text-sm text-[#7a9ab5]">{form.userId}</span>
                <CopyBtn value={form.userId} />
              </Row>
              <Row label="Language / Язык">
                <LangSelect value={form.language} onChange={set("language")} />
              </Row>
              <Row label="Имя">
                <TInput
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Введите имя"
                />
              </Row>
              <Row label="Телефон">
                <TInput
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+998 xx xxx xx xx"
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
              <Row label="Пароль">
                <TInput
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••"
                  type="password"
                />
              </Row>
              <Row label="Примечание">
                <TTextarea value={form.note} onChange={set("note")} />
              </Row>
            </div>
          </div>
        </div>

        {/* Security */}
        <p className="mb-3 text-[15px] font-medium text-[#c0d8e8]">
          Безопасность
        </p>
        <div className="mb-7 rounded-md border border-[#162840] bg-[#0f2030] px-6 py-4">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-sm font-medium text-[#c0d8e8]">
              2-этапная проверка
            </span>
            <Toggle active={twoFactor} onChange={setTwoFactor} />
          </div>
          <p className="max-w-2xl text-[12.5px] leading-relaxed text-[#456070]">
            Добавьте дополнительную защиту для вашего аккаунта amoCRM. Помимо
            пароля, при каждом входе потребуется вводить код из письма,
            отправленного на вашу электронную почту.
          </p>
        </div>

        {/* Sessions */}
        <p className="mb-3 text-[15px] font-medium text-[#c0d8e8]">Сеансы</p>
        <div className="rounded-md border border-[#162840] bg-[#0f2030] px-6 py-4">
          <p className="text-[12.5px] leading-relaxed text-[#456070]">
            Список авторизованных устройств. Сеансы завершаются через 3 месяца
            без активности. Если вы заметили что-то подозрительное, рекомендуем
            сменить пароль. После смены пароля вы автоматически выйдите из
            аккаунта на всех устройствах, кроме текущего.
          </p>
        </div>
      </div>
    </div>
  );
}
