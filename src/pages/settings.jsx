import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  Users,
  UserPlus,
  Trash2,
  Check,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("user");
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }
  return res;
}

// ── Sidebar sections ──────────────────────────────────────────────────────
const SECTIONS = [
  { key: "billing", label: "Счет и оплата" }, // Hisob va to'lov
  { key: "users", label: "Пользователи" }, // Foydalanuvchilar
  { key: "integrations", label: "Чаты и мессенджеры" }, // Integratsiyalar
];

// ── Small UI components ───────────────────────────────────────────────────
function Section({ title, description, children }) {
  return (
    <div className="mb-8">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="space-y-0 divide-y divide-[#1a3045] overflow-hidden rounded-xl border border-[#1a3045]">
        {children}
      </div>
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div className="flex items-center gap-4 bg-[#0f2030] px-6 py-4">
      <span className="w-52 shrink-0 text-sm text-gray-400">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function StyledInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-xs rounded-lg border border-[#1e3a52] bg-[#071828] px-3 py-2 text-sm text-white placeholder-gray-600 transition-colors outline-none focus:border-blue-500/50"
    />
  );
}

function StyledSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="scheme:dark w-full max-w-xs rounded-lg border border-[#1e3a52] bg-[#071828] px-3 py-2 text-sm text-white transition-colors outline-none focus:border-blue-500/50"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}

function ToggleRow({ label, hint, value, onChange }) {
  return (
    <div className="flex items-center gap-4 bg-[#0f2030] px-6 py-4">
      <div className="flex-1">
        <p className="text-sm text-white">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-gray-600">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200"
        style={{ background: value ? "#3b82f6" : "rgba(255,255,255,0.1)" }}
      >
        <span
          className="absolute h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: value ? "translateX(22px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  );
}

function InfoCard({ label, value, color = "#6b7280" }) {
  return (
    <div className="rounded-xl border border-[#1a3045] bg-[#0f2030] p-4">
      <p className="text-xs text-gray-600">{label}</p>
      <p className="mt-1 text-sm font-semibold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function RoleBadge({ role }) {
  const map = {
    SUPERADMIN: { l: "Super Admin", c: "#f59e0b", b: "rgba(245,158,11,0.12)" },
    ADMIN: { l: "Admin", c: "#3b82f6", b: "rgba(59,130,246,0.12)" },
    USER: { l: "Xodim", c: "#6b7280", b: "rgba(107,114,128,0.1)" },
  };
  const r = map[role] || map.USER;
  return (
    <span
      className="rounded-md px-2 py-0.5 text-xs font-semibold"
      style={{ color: r.c, background: r.b }}
    >
      {r.l}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
export default function settings() {
  const projectId = localStorage.getItem("projectId");

  const [active, setActive] = useState("general");
  const [saving, setSaving] = useState(false);

  // ── General ───────────────────────────────────────────────────────────
  const [g, setG] = useState({
    title: "",
    address: "",
    timezone: "Asia/Tashkent",
    country: "UZ",
    dateFormat: "DD.MM.YYYY",
    timeFormat: "24",
    currency: "UZS",
    nameOrder: "first_last",
    periodic: false,
  });

  // ── Users ─────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("SALESMANAGER");
  const [inviting, setInviting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ── Notifications ─────────────────────────────────────────────────────
  const [notif, setNotif] = useState({
    emailLead: true,
    emailTask: false,
    browser: false,
    telegram: false,
    daily: true,
    weekly: false,
  });

  // ── Integrations ──────────────────────────────────────────────────────
  const [integrations, setIntegrations] = useState({
    telegram: { connected: false, token: "" },
    instagram: { connected: false, token: "" },
    whatsapp: { connected: false, token: "" },
  });

  // ── Load users when tab opened ────────────────────────────────────────
  useEffect(() => {
    if (active !== "users" || users.length > 0) return;
    (async () => {
      setUsersLoading(true);
      try {
        const res = await apiFetch(`${API}/users?projectId=${projectId}`);
        if (!res) return;
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setUsers(Array.isArray(data) ? data : (data?.data ?? []));
        } catch {
          /* empty */
        }
      } catch (e) {
        console.error(e);
      } finally {
        setUsersLoading(false);
      }
    })();
  }, [active]);

  // ── Save handlers ─────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      if (active === "general") {
        // await apiFetch(`${API}/projects/${projectId}`, { method: "PATCH", body: JSON.stringify(g) });
        await new Promise((r) => setTimeout(r, 500));
      } else if (active === "ai") {
        await new Promise((r) => setTimeout(r, 500));
      } else if (active === "integrations") {
        await new Promise((r) => setTimeout(r, 500));
      } else {
        await new Promise((r) => setTimeout(r, 500));
      }
      toast.success("Saqlandi ✅");
    } catch {
      toast.error("Xatolik ❌");
    } finally {
      setSaving(false);
    }
  };

  // ── Invite ────────────────────────────────────────────────────────────
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await apiFetch(`${API}/users/invite`, {
        method: "POST",
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          projectId: Number(projectId),
        }),
      });
      if (!res || !res.ok) throw new Error();
      toast.success("Taklif yuborildi ✅");
      setInviteEmail("");
    } catch {
      toast.error("Xatolik ❌");
    } finally {
      setInviting(false);
    }
  };

  // ── Delete user ───────────────────────────────────────────────────────
  const handleDeleteUser = async (id) => {
    setDeletingId(id);
    try {
      const res = await apiFetch(`${API}/users/${id}`, { method: "DELETE" });
      if (!res || !res.ok) throw new Error();
      setUsers((p) => p.filter((u) => u.id !== id));
      toast.success("O'chirildi");
    } catch {
      toast.error("Xatolik ❌");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Connect integration ───────────────────────────────────────────────
  const connectInteg = async (key) => {
    if (!integrations[key].token.trim()) {
      toast.error("Token kiriting");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIntegrations((p) => ({ ...p, [key]: { ...p[key], connected: true } }));
    toast.success("Ulandi ✅");
    setSaving(false);
  };

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#071828]">
      {/* ═══ STICKY HEADER ═══ */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#1a3045] bg-[#071828] px-6 py-4">
        <h1 className="text-sm font-bold tracking-widest text-gray-300 uppercase">
          Настройки
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-40"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          Сохранить
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ═══ LEFT SIDEBAR ═══ */}
        <div className="flex w-56 shrink-0 flex-col border-r border-[#1a3045] bg-[#071828] py-3">
          {SECTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className="flex w-full items-center justify-between px-5 py-3 text-sm transition-colors"
              style={{
                color: active === key ? "#60a5fa" : "#9ca3af",
                background:
                  active === key ? "rgba(59,130,246,0.08)" : "transparent",
                borderLeft:
                  active === key
                    ? "2px solid #3b82f6"
                    : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="scrollbar-hide flex-1 overflow-y-auto bg-[#08192a] p-8">
          <div className="mx-auto max-w-3xl">
            {/* ════ HISOB VA TO'LOV ════ */}
            {active === "billing" && (
              <>
                <Section title="Тарифные планы">
                  <div className="grid grid-cols-3 gap-4 bg-[#0f2030] p-6">
                    {[
                      {
                        name: "Starter",
                        price: "99 000",
                        seats: 5,
                        color: "#6b7280",
                      },
                      {
                        name: "Pro",
                        price: "299 000",
                        seats: 20,
                        color: "#3b82f6",
                        current: true,
                      },
                      {
                        name: "Business",
                        price: "699 000",
                        seats: 100,
                        color: "#f59e0b",
                      },
                    ].map((plan) => (
                      <div
                        key={plan.name}
                        className="relative rounded-xl border p-4 text-center"
                        style={{
                          borderColor: plan.current
                            ? `${plan.color}50`
                            : "#1a3045",
                          background: plan.current
                            ? `${plan.color}10`
                            : "transparent",
                        }}
                      >
                        {plan.current && (
                          <span
                            className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                            style={{ background: plan.color }}
                          >
                            Текущий
                          </span>
                        )}
                        <p className="text-sm font-semibold text-white">
                          {plan.name}
                        </p>
                        <p
                          className="mt-1 text-xl font-bold"
                          style={{ color: plan.color }}
                        >
                          {plan.price}
                        </p>
                        <p className="text-[11px] text-gray-600">сум/месяц</p>
                        <p className="mt-1 text-xs text-gray-500">
                          до {plan.seats} польз.
                        </p>
                        {!plan.current && (
                          <button className="mt-3 w-full rounded-lg border border-[#1a3045] py-1.5 text-xs text-gray-400 transition-colors hover:text-white">
                            Перейти
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>

                <Section
                  title="Текущий тариф"
                  description="Информация о вашей подписке"
                >
                  <div className="bg-[#0f2030] p-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <InfoCard label="Тариф" value="Pro" color="#3b82f6" />
                      <InfoCard
                        label="Статус"
                        value="Активен"
                        color="#10b981"
                      />
                      <InfoCard
                        label="Следующий платёж"
                        value="01.04.2026"
                        color="#f59e0b"
                      />
                      <InfoCard
                        label="Сумма"
                        value="299 000 сум/мес"
                        color="#8b5cf6"
                      />
                    </div>

                    {/* seats bar */}
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
                        <span>Пользователи</span>
                        <span className="text-white">12 / 20</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: "60%" }}
                        />
                      </div>
                    </div>
                  </div>
                </Section>

                <Section title="История платежей">
                  {[
                    {
                      date: "01.03.2026",
                      amount: "299 000 сум",
                      invoice: "INV-2026-003",
                    },
                    {
                      date: "01.02.2026",
                      amount: "299 000 сум",
                      invoice: "INV-2026-002",
                    },
                    {
                      date: "01.01.2026",
                      amount: "299 000 сум",
                      invoice: "INV-2026-001",
                    },
                  ].map((row) => (
                    <div
                      key={row.invoice}
                      className="flex items-center gap-4 bg-[#0f2030] px-6 py-4"
                    >
                      <span className="w-32 text-sm text-gray-400">
                        {row.date}
                      </span>
                      <span className="flex-1 text-sm text-white">
                        {row.invoice}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {row.amount}
                      </span>
                      <span className="rounded-md bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
                        Оплачен
                      </span>
                    </div>
                  ))}
                </Section>
              </>
            )}

            {/* ════ FOYDALANUVCHILAR ════ */}
            {active === "users" && (
              <>
                <Section
                  title="Добавить пользователя"
                  description="Отправьте приглашение сотруднику"
                >
                  <form onSubmit={handleInvite}>
                    <FieldRow label="Email">
                      <StyledInput
                        type="email"
                        value={inviteEmail}
                        onChange={setInviteEmail}
                        placeholder="xodim@company.uz"
                      />
                    </FieldRow>
                    <FieldRow label="Роль">
                      <StyledSelect
                        value={inviteRole}
                        onChange={setInviteRole}
                        options={[
                          ["SALESMANAGER", "Sales Manager"],
                          ["ROP", "Direktor (ROP)"],
                        ]}
                      />
                    </FieldRow>
                    <div className="flex justify-end bg-[#0f2030] px-6 py-4">
                      <button
                        type="submit"
                        disabled={inviting || !inviteEmail.trim()}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-40"
                      >
                        {inviting ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <UserPlus size={13} />
                        )}
                        Отправить приглашение
                      </button>
                    </div>
                  </form>
                </Section>

                <Section title="Список пользователей">
                  {usersLoading ? (
                    <div className="flex justify-center bg-[#0f2030] py-10">
                      <Loader2
                        size={24}
                        className="animate-spin text-blue-400"
                      />
                    </div>
                  ) : users.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 bg-[#0f2030] py-12 text-center">
                      <Users size={28} className="text-gray-700" />
                      <p className="text-sm text-gray-600">
                        Пользователи не найдены
                      </p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 bg-[#0f2030] px-6 py-4 transition-colors hover:bg-[#112636]"
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                          style={{
                            background:
                              "linear-gradient(135deg,#1d4ed8,#7c3aed)",
                          }}
                        >
                          {user.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-white">
                            {user.email}
                          </p>
                          {user.fullName && (
                            <p className="text-xs text-gray-600">
                              {user.fullName}
                            </p>
                          )}
                        </div>
                        <RoleBadge role={user.role} />
                        <span className="text-xs text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                        </span>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deletingId === user.id}
                          className="ml-1 shrink-0 text-gray-700 transition-colors hover:text-red-400 disabled:opacity-40"
                        >
                          {deletingId === user.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </Section>
              </>
            )}

            {/* ════ INTEGRATSIYALAR ════ */}
            {active === "integrations" && (
              <>
                {[
                  {
                    key: "telegram",
                    label: "Telegram",
                    emoji: "🤖",
                    hint: "Получайте уведомления о лидах и задачах через Telegram бот",
                    color: "#2AABEE",
                  },
                  {
                    key: "instagram",
                    label: "Instagram",
                    emoji: "📸",
                    hint: "Принимайте DM сообщения как лиды",
                    color: "#E1306C",
                  },
                  {
                    key: "whatsapp",
                    label: "WhatsApp",
                    emoji: "💬",
                    hint: "Интеграция с WhatsApp Business API",
                    color: "#25D366",
                  },
                ].map(({ key, label, emoji, hint, color }) => {
                  const it = integrations[key];
                  return (
                    <Section
                      key={key}
                      title={`${emoji} ${label}`}
                      description={hint}
                    >
                      {it.connected ? (
                        <div className="flex items-center justify-between bg-[#0f2030] px-6 py-5">
                          <div
                            className="flex items-center gap-2"
                            style={{ color: "#10b981" }}
                          >
                            <Check size={16} />
                            <span className="text-sm font-medium">
                              Подключено
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setIntegrations((p) => ({
                                ...p,
                                [key]: { connected: false, token: "" },
                              }))
                            }
                            className="text-xs text-red-400 transition-colors hover:text-red-300"
                          >
                            Отключить
                          </button>
                        </div>
                      ) : (
                        <>
                          <FieldRow label="API Token">
                            <StyledInput
                              value={it.token}
                              onChange={(v) =>
                                setIntegrations((p) => ({
                                  ...p,
                                  [key]: { ...p[key], token: v },
                                }))
                              }
                              placeholder={`${label} token...`}
                            />
                          </FieldRow>
                          <div className="flex justify-end bg-[#0f2030] px-6 py-4">
                            <button
                              onClick={() => connectInteg(key)}
                              disabled={saving || !it.token.trim()}
                              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all disabled:opacity-40"
                              style={{ background: color }}
                            >
                              {saving ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Zap size={13} />
                              )}
                              Подключить
                            </button>
                          </div>
                        </>
                      )}
                    </Section>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
