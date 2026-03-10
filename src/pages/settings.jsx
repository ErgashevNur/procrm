import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  Users,
  UserPlus,
  Trash2,
  Check,
  Zap,
  Pen,
  X,
  CreditCard,
  Users2,
  Headset,
  MessageCircle,
  Mail,
  PhoneCall,
  Clock3,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  SendHorizonal,
  ImagePlus,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  { key: "billing", label: "Счет и оплата", icon: CreditCard }, // Hisob va to'lov
  { key: "users", label: "Пользователи", icon: Users2 }, // Foydalanuvchilar
  { key: "integrations", label: "Чаты и мессенджеры", icon: MessageCircle }, // Integratsiyalar
  { key: "support", label: "Поддержка", icon: Headset }, // Support
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
    ROP: { l: "ROP", c: "#3b82f6", b: "rgba(59,130,246,0.12)" },
    SALESMANAGER: {
      l: "Sales Manager",
      c: "#10b981",
      b: "rgba(16,185,129,0.12)",
    },
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
  const projectName = localStorage.getItem("projectName") || "";
  const companyId = (() => {
    try {
      const raw = localStorage.getItem("userData");
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      return Number(parsed?.user?.companyId || parsed?.companyId || 0);
    } catch {
      return 0;
    }
  })();
  const currentUser = (() => {
    try {
      const raw = localStorage.getItem("userData");
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed?.user || parsed || {};
    } catch {
      return {};
    }
  })();

  const [active, setActive] = useState("billing");
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
  const [inviteFullName, setInviteFullName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState("SALESMANAGER");
  const [inviting, setInviting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

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
  const [supportForm, setSupportForm] = useState({
    fullName: currentUser?.fullName || "",
    phone: currentUser?.phone || "",
    companyName: projectName || "",
    problem: "",
  });
  const [supportScreenshot, setSupportScreenshot] = useState(null);
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // ── Load users when tab opened ────────────────────────────────────────
  const extractUsersFromPayload = (payload) => {
    const candidates = [
      payload,
      payload?.data,
      payload?.items,
      payload?.users,
      payload?.results,
      payload?.result,
      payload?.data?.items,
      payload?.data?.users,
      payload?.data?.results,
      payload?.result?.items,
      payload?.result?.users,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
    }
    return [];
  };

  const normalizeUser = (user, fallbackRole) => ({
    id: Number(user?.id ?? user?.userId ?? user?._id),
    email: user?.email || "",
    fullName:
      user?.fullName ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim(),
    role: user?.role || fallbackRole,
    createdAt: user?.createdAt || null,
    companyId: Number(user?.companyId || companyId || 0),
  });

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const [ropRes, smRes] = await Promise.all([
        apiFetch(`${API}/user/all/rop`),
        apiFetch(`${API}/user/all/sales-manager`),
      ]);
      const [ropPayload, smPayload] = await Promise.all([
        ropRes?.ok ? ropRes.json() : Promise.resolve([]),
        smRes?.ok ? smRes.json() : Promise.resolve([]),
      ]);
      const rops = extractUsersFromPayload(ropPayload).map((u) =>
        normalizeUser(u, "ROP"),
      );
      const salesManagers = extractUsersFromPayload(smPayload).map((u) =>
        normalizeUser(u, "SALESMANAGER"),
      );
      const merged = [...rops, ...salesManagers].filter((u) => u.id);
      const unique = Array.from(
        new Map(merged.map((u) => [String(u.id), u])).values(),
      );
      setUsers(unique);
    } catch (e) {
      console.error(e);
      toast.error("Foydalanuvchilarni yuklab bo'lmadi");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (active !== "users") return;
    loadUsers();
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
    if (
      !inviteFullName.trim() ||
      !inviteEmail.trim() ||
      !invitePassword.trim()
    ) {
      toast.error("Ism, email va parol majburiy");
      return;
    }
    setInviting(true);
    try {
      const endpoint =
        inviteRole === "ROP" ? `${API}/user/rop` : `${API}/user/sales-manager`;
      const res = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          fullName: inviteFullName.trim(),
          email: inviteEmail.trim(),
          companyId: Number(companyId || 0),
          password: invitePassword,
          permissions: ["CRM", "PROHOME"],
        }),
      });
      if (!res || !res.ok) throw new Error();
      toast.success("Foydalanuvchi qo'shildi ✅");
      setInviteFullName("");
      setInviteEmail("");
      setInvitePassword("");
      await loadUsers();
    } catch {
      toast.error("Xatolik ❌");
    } finally {
      setInviting(false);
    }
  };

  // ── Delete user ───────────────────────────────────────────────────────
  const handleDeleteUser = async (id, role) => {
    if (role !== "SALESMANAGER") {
      toast.error("ROP ni o'chirish endpointi berilmagan");
      return;
    }
    setDeletingId(id);
    try {
      const res = await apiFetch(`${API}/user/remove-sales-maneger/${id}`, {
        method: "DELETE",
      });
      if (!res || !res.ok) throw new Error();
      setUsers((p) => p.filter((u) => u.id !== id));
      toast.success("O'chirildi");
    } catch {
      toast.error("Xatolik ❌");
    } finally {
      setDeletingId(null);
    }
  };

  const startEditUser = (user) => {
    setEditUserId(user.id);
    setEditFullName(user.fullName || "");
    setEditEmail(user.email || "");
    setEditPassword("");
  };

  const cancelEditUser = () => {
    setEditUserId(null);
    setEditFullName("");
    setEditEmail("");
    setEditPassword("");
  };

  const handleUpdateUser = async (user) => {
    if (!user?.id) return;
    if (!editFullName.trim() || !editEmail.trim()) {
      toast.error("Ism va email majburiy");
      return;
    }
    setUpdatingId(user.id);
    try {
      const endpoint =
        user.role === "ROP"
          ? `${API}/user/update-rop/${user.id}`
          : `${API}/user/update-sales-manager/${user.id}`;
      const body = {
        fullName: editFullName.trim(),
        email: editEmail.trim(),
        companyId: Number(user.companyId || companyId || 0),
        permissions: ["CRM", "PROHOME"],
      };
      if (editPassword.trim()) body.password = editPassword.trim();

      const res = await apiFetch(endpoint, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      if (!res || !res.ok) throw new Error();
      toast.success("Foydalanuvchi yangilandi ✅");
      await loadUsers();
      cancelEditUser();
    } catch {
      toast.error("Yangilashda xatolik ❌");
    } finally {
      setUpdatingId(null);
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

  const handleSupportFieldChange = (key, value) => {
    setSupportForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (
      !supportForm.fullName.trim() ||
      !supportForm.phone.trim() ||
      !supportForm.companyName.trim() ||
      !supportForm.problem.trim()
    ) {
      toast.error("Ism, telefon, kompaniya nomi va muammo majburiy");
      return;
    }

    setSupportSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      toast.info("Backend endpoint tayyor bo'lgach shu form ulanadi");
    } finally {
      setSupportSubmitting(false);
    }
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
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className="flex w-full items-center gap-3 px-5 py-3 text-sm transition-colors"
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
              <Icon size={16} className="shrink-0" />
              <span>{label}</span>
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
                    <FieldRow label="ФИО">
                      <StyledInput
                        value={inviteFullName}
                        onChange={setInviteFullName}
                        placeholder="Ism Familiya"
                      />
                    </FieldRow>
                    <FieldRow label="Email">
                      <StyledInput
                        type="email"
                        value={inviteEmail}
                        onChange={setInviteEmail}
                        placeholder="xodim@company.uz"
                      />
                    </FieldRow>
                    <FieldRow label="Пароль">
                      <StyledInput
                        type="password"
                        value={invitePassword}
                        onChange={setInvitePassword}
                        placeholder="Kamida 6 belgi"
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
                        disabled={
                          inviting ||
                          !inviteFullName.trim() ||
                          !inviteEmail.trim() ||
                          !invitePassword.trim()
                        }
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
                          {editUserId === user.id ? (
                            <div className="grid max-w-xl grid-cols-1 gap-2 md:grid-cols-3">
                              <input
                                type="text"
                                value={editFullName}
                                onChange={(e) =>
                                  setEditFullName(e.target.value)
                                }
                                placeholder="F.I.O"
                                className="rounded-lg border border-[#1e3a52] bg-[#071828] px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
                              />
                              <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                placeholder="Email"
                                className="rounded-lg border border-[#1e3a52] bg-[#071828] px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
                              />
                              <input
                                type="password"
                                value={editPassword}
                                onChange={(e) =>
                                  setEditPassword(e.target.value)
                                }
                                placeholder="Yangi parol (ixtiyoriy)"
                                className="rounded-lg border border-[#1e3a52] bg-[#071828] px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
                              />
                            </div>
                          ) : (
                            <>
                              <p className="truncate text-sm text-white">
                                {user.email}
                              </p>
                              {user.fullName && (
                                <p className="text-xs text-gray-600">
                                  {user.fullName}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        <RoleBadge role={user.role} />
                        <span className="text-xs text-gray-600">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                "ru-RU",
                              )
                            : "—"}
                        </span>
                        <div className="ml-1 flex items-center gap-1">
                          {editUserId === user.id ? (
                            <>
                              <button
                                onClick={() => handleUpdateUser(user)}
                                disabled={updatingId === user.id}
                                className="shrink-0 text-emerald-400 transition-colors hover:text-emerald-300 disabled:opacity-40"
                              >
                                {updatingId === user.id ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <Save size={15} />
                                )}
                              </button>
                              <button
                                onClick={cancelEditUser}
                                className="shrink-0 text-gray-500 transition-colors hover:text-white"
                              >
                                <X size={15} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEditUser(user)}
                              className="shrink-0 text-gray-500 transition-colors hover:text-blue-400"
                            >
                              <Pen size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user.id, user.role)}
                            disabled={
                              deletingId === user.id ||
                              user.role !== "SALESMANAGER"
                            }
                            className="shrink-0 text-gray-700 transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                            title={
                              user.role === "SALESMANAGER"
                                ? "O'chirish"
                                : "ROP delete endpoint berilmagan"
                            }
                          >
                            {deletingId === user.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
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

            {active === "support" && (
              <>
                <Section
                  title="Поддержка AI-CRM"
                  description="Savollar, texnik muammo yoki onboarding bo'yicha yordam olish uchun tezkor kanallar."
                >
                  <div className="grid gap-4 bg-[#0f2030] p-6 md:grid-cols-2">
                    {[
                      {
                        title: "Telegram support",
                        value: "Backend endpoint kutilmoqda",
                        hint: "Support form backendga ulangach Telegram support oqimi shu yerdan ishlaydi.",
                        icon: MessageCircle,
                        color: "#38bdf8",
                      },
                      {
                        title: "Email",
                        value: "support@company.com",
                        hint: "Haqiqiy support email backend va domen tayyor bo'lgach almashtiriladi.",
                        icon: Mail,
                        color: "#a78bfa",
                      },
                      {
                        title: "Telefon",
                        value: "+998 XX XXX XX XX",
                        hint: "Haqiqiy support raqami keyin ulanadi.",
                        icon: PhoneCall,
                        color: "#34d399",
                      },
                      {
                        title: "Ish vaqti",
                        value: "Du-Sha, 09:00-18:00",
                        hint: "O'zbekiston/Farg'ona bo'yicha. Kritik murojaatlar navbatdan tashqari ko'riladi.",
                        icon: Clock3,
                        color: "#f59e0b",
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isTelegramSupport = item.title === "Telegram support";
                      return (
                        <button
                          type="button"
                          key={item.title}
                          onClick={() => {
                            if (isTelegramSupport) setSupportModalOpen(true);
                          }}
                          className="rounded-2xl border border-[#1a3045] bg-[linear-gradient(180deg,rgba(10,23,37,0.94),rgba(7,24,40,0.82))] p-6 text-center shadow-[0_14px_32px_rgba(0,0,0,0.2)]"
                          style={{
                            cursor: isTelegramSupport ? "pointer" : "default",
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                              style={{
                                background: `${item.color}18`,
                                color: item.color,
                              }}
                            >
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white">
                                {item.title}
                              </p>
                              <p
                                className="mt-1 text-sm font-medium"
                                style={{ color: item.color }}
                              >
                                {item.value}
                              </p>
                              <p className="mt-4 text-xs leading-6 text-gray-500">
                                {item.hint}
                              </p>
                              {isTelegramSupport && (
                                <span className="mt-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold text-cyan-200">
                                  Endpoint kutilmoqda
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Section>

                <Section
                  title="Tezkor yordam"
                  description="Ko'p uchraydigan support scenariylari uchun tayyor yo'nalishlar."
                >
                  <div className="grid gap-4 bg-[#0f2030] p-6 md:grid-cols-3">
                    {[
                      {
                        title: "Texnik muammo",
                        text: "Sahifa ishlamay qolsa, xatolik matni va screenshot bilan supportga yozing.",
                        icon: Headset,
                        tone: "#60a5fa",
                      },
                      {
                        title: "Xavfsizlik",
                        text: "Rol, access yoki login muammolari bo'lsa prioritet tartibda ko'rib chiqiladi.",
                        icon: ShieldCheck,
                        tone: "#34d399",
                      },
                      {
                        title: "Qo'llanma",
                        text: "Status, lead manbasi yoki integratsiyalar bo'yicha qisqa yo'riqnoma olishingiz mumkin.",
                        icon: HelpCircle,
                        tone: "#f59e0b",
                      },
                    ].map((card) => {
                      const Icon = card.icon;
                      return (
                        <div
                          key={card.title}
                          className="rounded-2xl border border-[#1a3045] bg-[#0a1b2c] p-5"
                        >
                          <div
                            className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl"
                            style={{
                              background: `${card.tone}16`,
                              color: card.tone,
                            }}
                          >
                            <Icon size={18} />
                          </div>
                          <p className="text-sm font-semibold text-white">
                            {card.title}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-gray-500">
                            {card.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </Section>

                <Section
                  title="Murojaat yuborishdan oldin"
                  description="Support tezroq yordam berishi uchun quyidagilarni tayyorlab yuboring."
                >
                  {[
                    "Qaysi loyiha ichida muammo yuz berganini yozing.",
                    "Muammo qachon boshlanganini va takrorlash qadamlarini ko'rsating.",
                    "Agar xatolik chiqsa, screenshot yoki video qo'shing.",
                    "Qaysi foydalanuvchi rolida muammo kuzatilganini yozing.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 bg-[#0f2030] px-6 py-4"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-300">
                        •
                      </span>
                      <p className="text-sm text-gray-300">{item}</p>
                    </div>
                  ))}
                </Section>

                <Section
                  title="Foydali havolalar"
                  description="Keyinchalik haqiqiy knowledge base yoki docs bilan almashtiriladi."
                >
                  {[
                    {
                      label: "CRM bo'yicha qisqa yo'riqnoma",
                      href: "#",
                    },
                    {
                      label: "Lead va status bilan ishlash",
                      href: "#",
                    },
                    {
                      label: "Integratsiyalarni ulash bo'yicha checklist",
                      href: "#",
                    },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info("Knowledge base linki keyin ulanadi");
                      }}
                      className="flex items-center justify-between bg-[#0f2030] px-6 py-4 text-sm text-gray-300 transition-colors hover:bg-[#12283a] hover:text-white"
                    >
                      <span>{link.label}</span>
                      <ExternalLink size={14} className="text-gray-500" />
                    </a>
                  ))}
                </Section>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={supportModalOpen} onOpenChange={setSupportModalOpen}>
        <DialogContent className="border-[#1a3045] bg-[#0b1b2a] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI-CRM Support</DialogTitle>
            <DialogDescription className="text-gray-400">
              Backend endpoint tayyor bo'lgach shu forma xavfsiz tarzda support botga ulanadi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSupportSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold tracking-widest text-gray-500 uppercase">
                  Ism
                </label>
                <StyledInput
                  value={supportForm.fullName}
                  onChange={(value) => handleSupportFieldChange("fullName", value)}
                  placeholder="Ism Familiya"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold tracking-widest text-gray-500 uppercase">
                  Telefon
                </label>
                <StyledInput
                  value={supportForm.phone}
                  onChange={(value) => handleSupportFieldChange("phone", value)}
                  placeholder="+998 90 123 45 67"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold tracking-widest text-gray-500 uppercase">
                Kompaniya nomi
              </label>
              <StyledInput
                value={supportForm.companyName}
                onChange={(value) => handleSupportFieldChange("companyName", value)}
                placeholder="Kompaniya yoki loyiha nomi"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold tracking-widest text-gray-500 uppercase">
                Muammo
              </label>
              <textarea
                value={supportForm.problem}
                onChange={(e) => handleSupportFieldChange("problem", e.target.value)}
                placeholder="Muammoni iloji boricha aniq yozing..."
                className="min-h-32 w-full rounded-lg border border-[#1e3a52] bg-[#071828] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold tracking-widest text-gray-500 uppercase">
                Screenshot
              </label>
              <div className="flex flex-col gap-3">
                <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#2a4c69] bg-[#071828] px-3 py-2 text-sm text-gray-300 transition-colors hover:border-blue-400/50 hover:text-white">
                  <ImagePlus size={15} />
                  Screenshot yuklash
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSupportScreenshot(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {supportScreenshot ? (
                  <div className="flex items-center justify-between rounded-lg border border-[#1e3a52] bg-[#071828] px-3 py-2 text-xs text-gray-400">
                    <span className="truncate">{supportScreenshot.name}</span>
                    <button
                      type="button"
                      onClick={() => setSupportScreenshot(null)}
                      className="text-red-400 transition-colors hover:text-red-300"
                    >
                      Olib tashlash
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">
                    PNG, JPG yoki WebP screenshot yuborishingiz mumkin
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#1a3045] bg-[#0f2030] px-4 py-3">
              <p className="text-xs text-gray-500">
                Hozircha yuborish o'chirilgan. Backend endpoint berilgach shu joy ulanadi.
              </p>
              <button
                type="submit"
                disabled={supportSubmitting}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-40"
              >
                {supportSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <SendHorizonal size={14} />
                )}
                Endpoint kutilmoqda
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
