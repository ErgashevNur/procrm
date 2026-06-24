import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  Eye,
  EyeOff,
  UserCheck,
  Smile,
  Plus,
  Pencil,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { PhoneInput } from "@/components/ui/phone-input";
import { EmailInput } from "@/components/ui/email-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  canDeleteData,
  getCurrentRole,
  isSuperAdminLikeRole,
  MANAGEMENT_ROLES,
} from "@/lib/rbac";
import { apiUrl } from "@/lib/api";

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

const SECTION_KEYS = [
  { key: "billing", icon: CreditCard },
  { key: "users", icon: Users2 },
  { key: "visitors", icon: UserCheck, roles: MANAGEMENT_ROLES },
  { key: "moods", icon: Smile, roles: MANAGEMENT_ROLES },
  { key: "integrations", icon: MessageCircle },
  { key: "support", icon: Headset },
];

const MOOD_PRESET_COLORS = [
  "#ef4444","#f97316","#f59e0b","#eab308",
  "#84cc16","#22c55e","#10b981","#14b8a6",
  "#06b6d4","#3b82f6","#6366f1","#8b5cf6",
  "#a855f7","#ec4899","#f43f5e","#64748b",
];

function MoodColorPicker({ value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-8 gap-1.5">
        {MOOD_PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className="h-6 w-6 rounded-md transition-all hover:scale-110"
            style={{
              background: c,
              outline: value === c ? `2px solid ${c}` : "2px solid transparent",
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">Hex:</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
          className="h-7 w-24 rounded-md border border-[#1e3a52] bg-[#071828] px-2 text-xs text-white outline-none focus:border-blue-500/50"
        />
        <span className="h-7 w-7 rounded-md border border-[#1a3045]" style={{ background: value || "#6b7280" }} />
      </div>
    </div>
  );
}

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

function StyledInput({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full max-w-xs rounded-lg border border-[#1e3a52] bg-[#071828] px-3 py-2 text-sm text-white placeholder-gray-600 transition-colors outline-none focus:border-blue-500/50 ${className}`}
    />
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
    ADMIN: { l: "Admin", c: "#22c55e", b: "rgba(34,197,94,0.12)" },
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
export default function Settings() {
  const { t } = useTranslation();

  const role = getCurrentRole();
  const canDeleteUsers = canDeleteData(role);

  const SECTIONS = SECTION_KEYS
    .filter(({ roles: allowed }) => !allowed || allowed.includes(role))
    .map(({ key, icon }) => ({
      key,
      label: t(`settings.sections.${key}`),
      icon,
    }));

  const canManageVisitors = MANAGEMENT_ROLES.includes(role);
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
  const [inviting, setInviting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showInvitePassword, setShowInvitePassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
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

  // ── Visitors ──────────────────────────────────────────────────────────
  const [visitors, setVisitors] = useState([]);
  const [visitorsLoading, setVisitorsLoading] = useState(false);
  const [vName, setVName] = useState("");
  const [addingVisitor, setAddingVisitor] = useState(false);
  const [editVisitorId, setEditVisitorId] = useState(null);
  const [editVisitorName, setEditVisitorName] = useState("");
  const [updatingVisitorId, setUpdatingVisitorId] = useState(null);
  const [deletingVisitorId, setDeletingVisitorId] = useState(null);

  // ── Moods ────────────────────────────────────────────────────────────
  const [moods, setMoods] = useState([]);
  const [moodsLoading, setMoodsLoading] = useState(false);
  const [moodCreateName, setMoodCreateName] = useState("");
  const [moodCreateColor, setMoodCreateColor] = useState("#3b82f6");
  const [moodCreating, setMoodCreating] = useState(false);
  const [moodEditId, setMoodEditId] = useState(null);
  const [moodEditName, setMoodEditName] = useState("");
  const [moodEditColor, setMoodEditColor] = useState("#3b82f6");
  const [moodEditing, setMoodEditing] = useState(false);
  const [moodDeletingId, setMoodDeletingId] = useState(null);

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
      const salesManagerPromise = apiFetch(apiUrl("user/all/sales-manager"));
      const ropPromise = isSuperAdminLikeRole(role)
        ? apiFetch(apiUrl("user/all/rop"))
        : Promise.resolve(null);

      const [ropRes, smRes] = await Promise.all([
        ropPromise,
        salesManagerPromise,
      ]);
      const [ropPayload, smPayload] = await Promise.all([
        ropRes?.ok ? ropRes.json() : Promise.resolve([]),
        smRes?.ok ? smRes.json() : Promise.resolve([]),
      ]);

      const rops = isSuperAdminLikeRole(role)
        ? extractUsersFromPayload(ropPayload).map((u) =>
            normalizeUser(u, "ROP"),
          )
        : [];
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
      toast.error(t("common.loading"));
    } finally {
      setUsersLoading(false);
    }
  };

  const loadVisitors = async () => {
    setVisitorsLoading(true);
    try {
      const res = await apiFetch(apiUrl("lead-visitor/visitor/all"));
      if (!res?.ok) throw new Error();
      const data = await res.json();
      setVisitors(Array.isArray(data) ? data : []);
    } catch {
      toast.error(t("common.loading"));
    } finally {
      setVisitorsLoading(false);
    }
  };

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    if (!vName.trim()) {
      toast.error(t("settings.visitors.nameRequired"));
      return;
    }
    setAddingVisitor(true);
    try {
      const res = await apiFetch(apiUrl("lead-visitor/visitor"), {
        method: "POST",
        body: JSON.stringify({ fullName: vName.trim() }),
      });
      if (!res?.ok) throw new Error();
      setVName("");
      toast.success(t("settings.visitors.visitorAdded"));
      await loadVisitors();
    } catch {
      toast.error(t("settings.error"));
    } finally {
      setAddingVisitor(false);
    }
  };

  const startEditVisitor = (visitor) => {
    setEditVisitorId(visitor.id);
    setEditVisitorName(visitor.fullName);
  };

  const cancelEditVisitor = () => {
    setEditVisitorId(null);
    setEditVisitorName("");
  };

  const handleUpdateVisitor = async (id) => {
    if (!editVisitorName.trim()) return;
    setUpdatingVisitorId(id);
    try {
      const res = await apiFetch(apiUrl(`lead-visitor/visitor/${id}`), {
        method: "PATCH",
        body: JSON.stringify({ fullName: editVisitorName.trim() }),
      });
      if (!res?.ok) throw new Error();
      toast.success(t("settings.visitors.visitorUpdated"));
      await loadVisitors();
      cancelEditVisitor();
    } catch {
      toast.error(t("settings.error"));
    } finally {
      setUpdatingVisitorId(null);
    }
  };

  const handleDeleteVisitor = async (id) => {
    setDeletingVisitorId(id);
    try {
      const res = await apiFetch(apiUrl(`lead-visitor/visitor/${id}`), {
        method: "DELETE",
      });
      if (res?.status === 400) {
        toast.error(t("settings.visitors.deleteError"));
        return;
      }
      if (!res?.ok) throw new Error();
      setVisitors((prev) => prev.filter((v) => v.id !== id));
      toast.success(t("settings.visitors.visitorDeleted"));
    } catch {
      toast.error(t("settings.error"));
    } finally {
      setDeletingVisitorId(null);
    }
  };

  const loadMoods = async () => {
    setMoodsLoading(true);
    try {
      const res = await apiFetch(apiUrl("lead-mood"));
      if (!res || !res.ok) return;
      const data = await res.json();
      setMoods(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Kayfiyatlar yuklanmadi");
    } finally {
      setMoodsLoading(false);
    }
  };

  const handleMoodCreate = async (e) => {
    e.preventDefault();
    if (!moodCreateName.trim()) return;
    setMoodCreating(true);
    try {
      const res = await apiFetch(apiUrl("lead-mood"), {
        method: "POST",
        body: JSON.stringify({ name: moodCreateName.trim(), color: moodCreateColor }),
      });
      if (!res || !res.ok) throw new Error();
      const data = await res.json();
      setMoods((p) => [...p, data]);
      setMoodCreateName("");
      setMoodCreateColor("#3b82f6");
      toast.success("Kayfiyat qo'shildi ✅");
    } catch {
      toast.error("Xatolik ❌");
    } finally {
      setMoodCreating(false);
    }
  };

  const startMoodEdit = (mood) => {
    setMoodEditId(mood.id);
    setMoodEditName(mood.name);
    setMoodEditColor(mood.color || "#3b82f6");
  };

  const cancelMoodEdit = () => {
    setMoodEditId(null);
    setMoodEditName("");
    setMoodEditColor("#3b82f6");
  };

  const handleMoodUpdate = async (id) => {
    if (!moodEditName.trim()) return;
    setMoodEditing(true);
    try {
      const res = await apiFetch(apiUrl(`lead-mood/${id}`), {
        method: "PATCH",
        body: JSON.stringify({ name: moodEditName.trim(), color: moodEditColor }),
      });
      if (!res || !res.ok) throw new Error();
      setMoods((p) =>
        p.map((m) => (m.id === id ? { ...m, name: moodEditName.trim(), color: moodEditColor } : m)),
      );
      cancelMoodEdit();
      toast.success("Yangilandi ✅");
    } catch {
      toast.error("Xatolik ❌");
    } finally {
      setMoodEditing(false);
    }
  };

  const handleMoodDelete = async (id) => {
    if (!window.confirm("O'chirilsinmi?")) return;
    setMoodDeletingId(id);
    try {
      const res = await apiFetch(apiUrl(`lead-mood/${id}`), { method: "DELETE" });
      if (!res || !res.ok) throw new Error();
      setMoods((p) => p.filter((m) => m.id !== id));
      toast.success("O'chirildi ✅");
    } catch {
      toast.error("O'chirishda xato ❌");
    } finally {
      setMoodDeletingId(null);
    }
  };

  useEffect(() => {
    if (active === "users") loadUsers();
    else if (active === "visitors") loadVisitors();
    else if (active === "moods") loadMoods();
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
      toast.success(t("settings.saved"));
    } catch {
      toast.error(t("settings.error"));
    } finally {
      setSaving(false);
    }
  };

  // ── Invite ────────────────────────────────────────────────────────────
  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await apiFetch(apiUrl("user/sales-manager"), {
        method: "POST",
        body: JSON.stringify({
          fullName: inviteFullName.trim(),
          email: inviteEmail.trim(),
          companyId: Number(companyId || 0),
          password: invitePassword,
          permissions: ["CRM", "PROHOME"],
        }),
      });
      if (!res) return;

      let payload = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        payload = await res.json().catch(() => null);
      } else {
        await res.text().catch(() => "");
      }

      const requestSucceeded =
        res.ok ||
        payload?.success === true ||
        payload?.status === "success" ||
        payload?.created === true ||
        Boolean(
          payload?.user ||
          payload?.data?.user ||
          payload?.data?.id ||
          payload?.id,
        );

      if (requestSucceeded) {
        toast.success(t("settings.users.userAdded"));
        setInviteFullName("");
        setInviteEmail("");
        setInvitePassword("");
      }

      await loadUsers();
    } catch (error) {
      console.error("Invite user failed:", error);
    } finally {
      setInviting(false);
    }
  };

  // ── Delete user ───────────────────────────────────────────────────────
  const handleDeleteUser = async (id, role) => {
    if (!canDeleteUsers) {
      toast.error(t("settings.users.noDeletePermission"));
      return;
    }
    if (role !== "SALESMANAGER") {
      toast.error("ROP ni o'chirish endpointi berilmagan");
      return;
    }
    setDeletingId(id);
    try {
      const res = await apiFetch(apiUrl(`user/remove-sales-maneger/${id}`), {
        method: "DELETE",
      });
      if (!res || !res.ok) throw new Error();
      setUsers((p) => p.filter((u) => u.id !== id));
      toast.success(t("settings.users.userDeleted"));
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
    setShowEditPassword(false);
  };

  const cancelEditUser = () => {
    setEditUserId(null);
    setEditFullName("");
    setEditEmail("");
    setEditPassword("");
    setShowEditPassword(false);
  };

  const handleUpdateUser = async (user) => {
    if (!user?.id) return;
    if (!editFullName.trim() || !editEmail.trim()) {
      toast.error(t("settings.users.nameEmailRequired"));
      return;
    }
    setUpdatingId(user.id);
    try {
      const endpoint =
        user.role === "ROP"
          ? apiUrl(`user/update-rop/${user.id}`)
          : apiUrl(`user/update-sales-manager/${user.id}`);
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
      toast.success(t("settings.users.userUpdated"));
      await loadUsers();
      cancelEditUser();
    } catch {
      toast.error(t("settings.users.updateError"));
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Connect integration ───────────────────────────────────────────────
  const connectInteg = async (key) => {
    if (!integrations[key].token.trim()) {
      toast.error(t("settings.integrations.tokenRequired"));
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIntegrations((p) => ({ ...p, [key]: { ...p[key], connected: true } }));
    toast.success(t("settings.integrations.connectSuccess"));
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
      toast.error(t("settings.support.requiredFields"));
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
          {t("settings.title")}
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
          {t("common.save")}
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
                <Section title={t("settings.billing.pricingPlans")}>
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
                            {t("settings.billing.current")}
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
                        <p className="text-[11px] text-gray-600">{t("settings.billing.perMonth")}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {plan.seats} {t("settings.billing.upToUsers")}
                        </p>
                        {!plan.current && (
                          <button className="mt-3 w-full rounded-lg border border-[#1a3045] py-1.5 text-xs text-gray-400 transition-colors hover:text-white">
                            {t("settings.billing.switchPlan")}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>

                <Section
                  title={t("settings.billing.currentPlan")}
                  description={t("settings.billing.subscriptionInfo")}
                >
                  <div className="bg-[#0f2030] p-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <InfoCard label={t("settings.billing.plan")} value="Pro" color="#3b82f6" />
                      <InfoCard
                        label={t("settings.billing.status")}
                        value={t("settings.billing.active")}
                        color="#10b981"
                      />
                      <InfoCard
                        label={t("settings.billing.nextPayment")}
                        value="01.04.2026"
                        color="#f59e0b"
                      />
                      <InfoCard
                        label={t("settings.billing.amount")}
                        value="299 000 сум/мес"
                        color="#8b5cf6"
                      />
                    </div>

                    {/* seats bar */}
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
                        <span>{t("settings.billing.users")}</span>
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

                <Section title={t("settings.billing.paymentHistory")}>
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
                        {t("settings.billing.paid")}
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
                  title={t("settings.users.addUser")}
                  description={t("settings.users.inviteDescription")}
                >
                  <form onSubmit={handleInvite} noValidate>
                    <FieldRow label={t("settings.users.fullName")}>
                      <StyledInput
                        value={inviteFullName}
                        onChange={setInviteFullName}
                        placeholder={t("profile.fullNamePlaceholder")}
                      />
                    </FieldRow>
                    <FieldRow label={t("common.email")}>
                      <EmailInput
                        value={inviteEmail}
                        onChange={setInviteEmail}
                        placeholder="xodim"
                        className="max-w-xs"
                      />
                    </FieldRow>
                    <FieldRow label={t("settings.users.password")}>
                      <div className="relative w-full max-w-xs">
                        <StyledInput
                          type={showInvitePassword ? "text" : "password"}
                          value={invitePassword}
                          onChange={setInvitePassword}
                          placeholder={t("settings.users.passwordPlaceholder")}
                          className="max-w-none pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowInvitePassword((prev) => !prev)}
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
                          aria-label={
                            showInvitePassword
                              ? t("settings.users.hidePassword")
                              : t("settings.users.showPassword")
                          }
                        >
                          {showInvitePassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </FieldRow>
                    <div className="flex justify-stretch bg-[#0f2030] px-4 py-4 sm:justify-end sm:px-6">
                      <button
                        type="submit"
                        disabled={inviting}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-40 sm:w-auto"
                      >
                        {inviting ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <UserPlus size={13} />
                        )}
                        {t("settings.users.sendInvite")}
                      </button>
                    </div>
                  </form>
                </Section>

                <Section title={t("settings.users.usersList")}>
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
                        {t("settings.users.noUsers")}
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
                              <EmailInput
                                value={editEmail}
                                onChange={setEditEmail}
                                placeholder="email"
                              />
                              <div className="relative">
                                <input
                                  type={showEditPassword ? "text" : "password"}
                                  value={editPassword}
                                  onChange={(e) =>
                                    setEditPassword(e.target.value)
                                  }
                                  placeholder={t("settings.users.newPassword")}
                                  className="w-full rounded-lg border border-[#1e3a52] bg-[#071828] px-3 py-2 pr-9 text-xs text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowEditPassword((prev) => !prev)
                                  }
                                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
                                  aria-label={
                                    showEditPassword
                                      ? "Parolni yashirish"
                                      : "Parolni ko'rsatish"
                                  }
                                >
                                  {showEditPassword ? (
                                    <EyeOff size={15} />
                                  ) : (
                                    <Eye size={15} />
                                  )}
                                </button>
                              </div>
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
                              user.role !== "SALESMANAGER" ||
                              !canDeleteUsers
                            }
                            className="shrink-0 text-gray-700 transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                            title={
                              !canDeleteUsers
                                ? "Sizda o'chirish huquqi yo'q"
                                : user.role === "SALESMANAGER"
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

            {/* ════ TASHRIF BUYURUVCHILAR ════ */}
            {active === "visitors" && (
              <>
                {canManageVisitors && (
                  <Section
                    title={t("settings.visitors.addVisitor")}
                    description={t("settings.visitors.addDescription")}
                  >
                    <form onSubmit={handleAddVisitor} noValidate>
                      <FieldRow label={t("settings.visitors.visitorName")}>
                        <StyledInput
                          value={vName}
                          onChange={setVName}
                          placeholder={t("settings.visitors.namePlaceholder")}
                        />
                      </FieldRow>
                      <div className="flex justify-stretch bg-[#0f2030] px-4 py-4 sm:justify-end sm:px-6">
                        <button
                          type="submit"
                          disabled={addingVisitor}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-40 sm:w-auto"
                        >
                          {addingVisitor ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <UserPlus size={13} />
                          )}
                          {t("settings.visitors.addButton")}
                        </button>
                      </div>
                    </form>
                  </Section>
                )}

                <Section title={t("settings.visitors.listTitle")}>
                  {visitorsLoading ? (
                    <div className="flex justify-center bg-[#0f2030] py-10">
                      <Loader2 size={24} className="animate-spin text-blue-400" />
                    </div>
                  ) : visitors.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 bg-[#0f2030] py-12 text-center">
                      <Users size={28} className="text-gray-700" />
                      <p className="text-sm text-gray-600">
                        {t("settings.visitors.noVisitors")}
                      </p>
                    </div>
                  ) : (
                    visitors.map((visitor) => (
                      <div
                        key={visitor.id}
                        className="flex items-center gap-4 bg-[#0f2030] px-6 py-4 transition-colors hover:bg-[#112636]"
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                          style={{
                            background: "linear-gradient(135deg,#0ea5e9,#3b82f6)",
                          }}
                        >
                          {visitor.fullName?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          {editVisitorId === visitor.id ? (
                            <input
                              type="text"
                              value={editVisitorName}
                              onChange={(e) => setEditVisitorName(e.target.value)}
                              autoFocus
                              className="rounded-lg border border-[#1e3a52] bg-[#071828] px-3 py-1.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
                            />
                          ) : (
                            <>
                              <p className="truncate text-sm text-white">
                                {visitor.fullName}
                              </p>
                              <p className="text-xs text-gray-600">
                                {visitor._count?.leadVisitors || 0}{" "}
                                {t("settings.visitors.connectedLeads")}
                              </p>
                            </>
                          )}
                        </div>
                        <span className="text-xs text-gray-600">
                          {visitor.createdAt
                            ? new Date(visitor.createdAt).toLocaleDateString("ru-RU")
                            : "—"}
                        </span>
                        {canManageVisitors && (
                          <div className="ml-1 flex items-center gap-1">
                            {editVisitorId === visitor.id ? (
                              <>
                                <button
                                  onClick={() => handleUpdateVisitor(visitor.id)}
                                  disabled={updatingVisitorId === visitor.id}
                                  className="shrink-0 text-emerald-400 transition-colors hover:text-emerald-300 disabled:opacity-40"
                                >
                                  {updatingVisitorId === visitor.id ? (
                                    <Loader2 size={15} className="animate-spin" />
                                  ) : (
                                    <Save size={15} />
                                  )}
                                </button>
                                <button
                                  onClick={cancelEditVisitor}
                                  className="shrink-0 text-gray-500 transition-colors hover:text-white"
                                >
                                  <X size={15} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEditVisitor(visitor)}
                                className="shrink-0 text-gray-500 transition-colors hover:text-blue-400"
                              >
                                <Pen size={15} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteVisitor(visitor.id)}
                              disabled={deletingVisitorId === visitor.id}
                              className="shrink-0 text-gray-700 transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                              title={
                                (visitor._count?.leadVisitors || 0) > 0
                                  ? t("settings.visitors.deleteError")
                                  : "O'chirish"
                              }
                            >
                              {deletingVisitorId === visitor.id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </Section>
              </>
            )}

            {/* ════ MIJOZ KAYFIYATLARI ════ */}
            {active === "moods" && (
              <>
                <Section
                  title="Mijoz kayfiyatlari"
                  description="Leadlarning shaxsiy xususiyatlarini belgilash uchun kayfiyat turlari"
                >
                  {/* Create form */}
                  <form onSubmit={handleMoodCreate}>
                    <div className="flex flex-wrap items-end gap-4 bg-[#0f2030] px-6 py-5">
                      <div className="flex-1" style={{ minWidth: 180 }}>
                        <p className="mb-1.5 text-xs text-gray-500">Kayfiyat nomi</p>
                        <input
                          value={moodCreateName}
                          onChange={(e) => setMoodCreateName(e.target.value)}
                          placeholder="Masalan: Jahldor, Qiziquvchan..."
                          className="w-full rounded-lg border border-[#1e3a52] bg-[#071828] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs text-gray-500">Rang</p>
                        <MoodColorPicker value={moodCreateColor} onChange={setMoodCreateColor} />
                      </div>
                      <button
                        type="submit"
                        disabled={moodCreating || !moodCreateName.trim()}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all disabled:opacity-40"
                        style={{ background: moodCreateColor || "#3b82f6" }}
                      >
                        {moodCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Qo'shish
                      </button>
                    </div>
                  </form>

                  {/* List */}
                  {moodsLoading ? (
                    <div className="flex justify-center bg-[#0f2030] py-8">
                      <Loader2 size={22} className="animate-spin text-blue-400" />
                    </div>
                  ) : moods.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 bg-[#0f2030] py-10 text-center">
                      <Smile size={32} className="text-gray-700" />
                      <p className="text-sm text-gray-600">Hali kayfiyat yo'q</p>
                    </div>
                  ) : (
                    moods.map((mood) => (
                      <div key={mood.id} className="bg-[#0f2030] px-6 py-4">
                        {moodEditId === mood.id ? (
                          <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1" style={{ minWidth: 160 }}>
                              <input
                                value={moodEditName}
                                onChange={(e) => setMoodEditName(e.target.value)}
                                autoFocus
                                className="w-full rounded-lg border border-[#1e3a52] bg-[#071828] px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                              />
                            </div>
                            <MoodColorPicker value={moodEditColor} onChange={setMoodEditColor} />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleMoodUpdate(mood.id)}
                                disabled={moodEditing || !moodEditName.trim()}
                                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-green-500 disabled:opacity-40"
                              >
                                {moodEditing ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                Saqlash
                              </button>
                              <button
                                onClick={cancelMoodEdit}
                                className="flex items-center gap-1.5 rounded-lg border border-[#1a3045] px-3 py-2 text-xs text-gray-400 transition-colors hover:text-white"
                              >
                                <X size={12} />
                                Bekor
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <span
                              className="h-3 w-3 shrink-0 rounded-full"
                              style={{ background: mood.color || "#6b7280" }}
                            />
                            <span
                              className="rounded-lg px-3 py-1 text-sm font-semibold"
                              style={{
                                background: `${mood.color || "#6b7280"}18`,
                                color: mood.color || "#9ca3af",
                                border: `1px solid ${mood.color || "#6b7280"}35`,
                              }}
                            >
                              {mood.name}
                            </span>
                            <div className="ml-auto flex items-center gap-1">
                              <button
                                onClick={() => startMoodEdit(mood)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-white/10 hover:text-blue-400"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleMoodDelete(mood.id)}
                                disabled={moodDeletingId === mood.id}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-white/10 hover:text-red-400 disabled:opacity-40"
                              >
                                {moodDeletingId === mood.id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Trash2 size={13} />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
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
                    hintKey: "settings.integrations.telegramHint",
                    color: "#2AABEE",
                  },
                  {
                    key: "instagram",
                    label: "Instagram",
                    emoji: "📸",
                    hintKey: "settings.integrations.instagramHint",
                    color: "#E1306C",
                  },
                  {
                    key: "whatsapp",
                    label: "WhatsApp",
                    emoji: "💬",
                    hintKey: "settings.integrations.whatsappHint",
                    color: "#25D366",
                  },
                ].map(({ key, label, emoji, hintKey, color }) => {
                  const it = integrations[key];
                  return (
                    <Section
                      key={key}
                      title={`${emoji} ${label}`}
                      description={t(hintKey)}
                    >
                      {it.connected ? (
                        <div className="flex items-center justify-between bg-[#0f2030] px-6 py-5">
                          <div
                            className="flex items-center gap-2"
                            style={{ color: "#10b981" }}
                          >
                            <Check size={16} />
                            <span className="text-sm font-medium">
                              {t("settings.integrations.connected")}
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
                            {t("settings.integrations.disconnect")}
                          </button>
                        </div>
                      ) : (
                        <>
                          <FieldRow label={t("settings.integrations.apiToken")}>
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
                              {t("settings.integrations.connect")}
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
                  title={t("settings.support.title")}
                  description={t("settings.support.description")}
                >
                  <div className="grid gap-4 bg-[#0f2030] p-6 md:grid-cols-2">
                    {[
                      {
                        titleKey: "settings.support.telegramSupport",
                        value: t("settings.support.endpointPending"),
                        hintKey: "settings.support.telegramHint",
                        icon: MessageCircle,
                        color: "#38bdf8",
                        isTelegram: true,
                      },
                      {
                        titleKey: "Email",
                        value: "support@company.com",
                        hintKey: "settings.support.emailHint",
                        icon: Mail,
                        color: "#a78bfa",
                        isTelegram: false,
                      },
                      {
                        titleKey: "settings.support.phoneTitle",
                        value: "+998 XX XXX XX XX",
                        hintKey: "settings.support.phoneHint",
                        icon: PhoneCall,
                        color: "#34d399",
                        isTelegram: false,
                      },
                      {
                        titleKey: "settings.support.workingHours",
                        value: "Du-Sha, 09:00-18:00",
                        hintKey: "settings.support.workingHoursHint",
                        icon: Clock3,
                        color: "#f59e0b",
                        isTelegram: false,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      const title = item.titleKey.startsWith("Email") ? item.titleKey : t(item.titleKey);
                      return (
                        <button
                          type="button"
                          key={item.titleKey}
                          onClick={() => {
                            if (item.isTelegram) setSupportModalOpen(true);
                          }}
                          className="rounded-2xl border border-[#1a3045] bg-[linear-gradient(180deg,rgba(10,23,37,0.94),rgba(7,24,40,0.82))] p-6 text-center shadow-[0_14px_32px_rgba(0,0,0,0.2)]"
                          style={{
                            cursor: item.isTelegram ? "pointer" : "default",
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
                                {title}
                              </p>
                              <p
                                className="mt-1 text-sm font-medium"
                                style={{ color: item.color }}
                              >
                                {item.value}
                              </p>
                              <p className="mt-4 text-xs leading-6 text-gray-500">
                                {t(item.hintKey)}
                              </p>
                              {item.isTelegram && (
                                <span className="mt-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold text-cyan-200">
                                  {t("settings.support.endpointPending")}
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
                  title={t("settings.support.quickHelp")}
                  description={t("settings.support.quickHelpDesc")}
                >
                  <div className="grid gap-4 bg-[#0f2030] p-6 md:grid-cols-3">
                    {[
                      {
                        titleKey: "settings.support.technicalIssue",
                        textKey: "settings.support.technicalText",
                        icon: Headset,
                        tone: "#60a5fa",
                      },
                      {
                        titleKey: "settings.support.security",
                        textKey: "settings.support.securityText",
                        icon: ShieldCheck,
                        tone: "#34d399",
                      },
                      {
                        titleKey: "settings.support.guide",
                        textKey: "settings.support.guideText",
                        icon: HelpCircle,
                        tone: "#f59e0b",
                      },
                    ].map((card) => {
                      const Icon = card.icon;
                      return (
                        <div
                          key={card.titleKey}
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
                            {t(card.titleKey)}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-gray-500">
                            {t(card.textKey)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </Section>

                <Section
                  title={t("settings.support.beforeContact")}
                  description={t("settings.support.beforeContactDesc")}
                >
                  {(t("settings.support.beforeItems", { returnObjects: true }) || []).map((item, i) => (
                    <div
                      key={i}
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
                  title={t("settings.support.usefulLinks")}
                  description={t("settings.support.usefulLinksDesc")}
                >
                  {[
                    { labelKey: "settings.support.link1", href: "#" },
                    { labelKey: "settings.support.link2", href: "#" },
                    { labelKey: "settings.support.link3", href: "#" },
                  ].map((link) => (
                    <a
                      key={link.labelKey}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info(t("settings.support.endpointPending"));
                      }}
                      className="flex items-center justify-between bg-[#0f2030] px-6 py-4 text-sm text-gray-300 transition-colors hover:bg-[#12283a] hover:text-white"
                    >
                      <span>{t(link.labelKey)}</span>
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
            <DialogTitle>{t("settings.support.modalTitle")}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {t("settings.support.modalDesc")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSupportSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold tracking-widest text-gray-500 uppercase">
                  {t("settings.support.fullName")}
                </label>
                <StyledInput
                  value={supportForm.fullName}
                  onChange={(value) =>
                    handleSupportFieldChange("fullName", value)
                  }
                  placeholder={t("profile.fullNamePlaceholder")}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold tracking-widest text-gray-500 uppercase">
                  {t("common.phone")}
                </label>
                <PhoneInput
                  value={supportForm.phone}
                  onChange={(value) => handleSupportFieldChange("phone", value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold tracking-widest text-gray-500 uppercase">
                {t("settings.support.companyName")}
              </label>
              <StyledInput
                value={supportForm.companyName}
                onChange={(value) =>
                  handleSupportFieldChange("companyName", value)
                }
                placeholder={t("settings.support.companyPlaceholder")}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold tracking-widest text-gray-500 uppercase">
                {t("settings.support.problem")}
              </label>
              <textarea
                value={supportForm.problem}
                onChange={(e) =>
                  handleSupportFieldChange("problem", e.target.value)
                }
                placeholder={t("settings.support.problemPlaceholder")}
                className="min-h-32 w-full rounded-lg border border-[#1e3a52] bg-[#071828] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold tracking-widest text-gray-500 uppercase">
                {t("settings.support.screenshot")}
              </label>
              <div className="flex flex-col gap-3">
                <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#2a4c69] bg-[#071828] px-3 py-2 text-sm text-gray-300 transition-colors hover:border-blue-400/50 hover:text-white">
                  <ImagePlus size={15} />
                  {t("settings.support.screenshotUpload")}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setSupportScreenshot(e.target.files?.[0] || null)
                    }
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
                      {t("settings.support.removeFile")}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">
                    {t("settings.support.screenshotHint")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#1a3045] bg-[#0f2030] px-4 py-3">
              <p className="text-xs text-gray-500">
                {t("settings.support.formPending")}
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
                {t("settings.support.endpointPending")}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
