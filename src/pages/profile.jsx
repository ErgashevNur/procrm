import { useState, useEffect } from "react";
import {
  LogOut,
  Shield,
  Mail,
  Building2,
  Clock,
  CheckCircle2,
  Key,
  User,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ── Role badge ────────────────────────────────────────────────────────────
const ROLE_MAP = {
  SUPERADMIN: {
    label: "Super Admin",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    icon: Shield,
  },
  ADMIN: {
    label: "Admin",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    icon: Shield,
  },
  USER: {
    label: "Foydalanuvchi",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.1)",
    icon: User,
  },
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Avatar({ email }) {
  const letter = email ? email[0].toUpperCase() : "?";
  return (
    <div
      className="relative flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-black text-white"
      style={{
        background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)",
        boxShadow:
          "0 0 0 4px rgba(59,130,246,0.15), 0 8px 32px rgba(59,130,246,0.25)",
      }}
    >
      {letter}
      {/* Online dot */}
      <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#0a1929] bg-green-500">
        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-green-300" />
      </span>
    </div>
  );
}

// ── Info Row ──────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, color = "#6b7280" }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
      >
        <Icon size={14} style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-600">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-white">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

// ── Permission Badge ──────────────────────────────────────────────────────
function PermBadge({ name, active }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 transition-all ${
        active
          ? "border-green-500/20 bg-green-500/5"
          : "border-white/5 bg-white/[0.02] opacity-40"
      }`}
    >
      <CheckCircle2
        size={15}
        className={active ? "text-green-400" : "text-gray-600"}
      />
      <span
        className={`text-sm font-medium ${active ? "text-white" : "text-gray-600"}`}
      >
        {name}
      </span>
      <span
        className={`ml-auto rounded-md px-2 py-0.5 text-[10px] font-bold ${
          active ? "bg-green-500/15 text-green-400" : "bg-white/5 text-gray-600"
        }`}
      >
        {active ? "Faol" : "Yopiq"}
      </span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    try {
      // localStorage da "userData" key bilan saqlangan object
      const raw = localStorage.getItem("userData");
      if (raw) {
        setUserData(JSON.parse(raw));
      } else {
        // Agar "userData" yo'q bo'lsa, alohida keylardan yig'amiz
        setUserData({
          user: {
            email: localStorage.getItem("email") || "",
            companyId: localStorage.getItem("companyId") || "",
            role: localStorage.getItem("role") || "USER",
            createdAt: localStorage.getItem("createdAt") || "",
            updateAt: localStorage.getItem("updateAt") || "",
          },
          permission: {},
        });
      }
    } catch {
      console.error("userData parse xatosi");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!userData) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#071828]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />
      </div>
    );
  }

  const { user = {}, permission = {} } = userData;
  const roleInfo = ROLE_MAP[user.role] || ROLE_MAP.USER;
  const RoleIcon = roleInfo.icon;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#071828]">
      {/* ── Grid bg ─────────────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `
          linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
        `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Glow ────────────────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #3b82f6, transparent)",
          filter: "blur(60px)",
        }}
      />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="scrollbar-hide relative flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-lg space-y-4">
          {/* ── Hero card ─────────────────────────────────────────── */}
          <div
            className="overflow-hidden rounded-2xl border border-white/[0.06]"
            style={{
              background: "linear-gradient(145deg, #0f2438 0%, #0a1929 100%)",
              animation: "fadeUp .4s ease both",
            }}
          >
            {/* Top stripe */}
            <div
              className="h-1 w-full"
              style={{
                background: `linear-gradient(90deg, ${roleInfo.color}, transparent)`,
              }}
            />

            <div className="flex items-center gap-5 p-6">
              <Avatar email={user.email} />

              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold text-white">
                  {user.email?.split("@")[0] || "Foydalanuvchi"}
                </p>
                <p className="truncate text-sm text-gray-500">{user.email}</p>

                {/* Role badge */}
                <div
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1"
                  style={{
                    background: roleInfo.bg,
                    border: `1px solid ${roleInfo.color}30`,
                  }}
                >
                  <RoleIcon size={11} style={{ color: roleInfo.color }} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: roleInfo.color }}
                  >
                    {roleInfo.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Ma'lumotlar ───────────────────────────────────────── */}
          <div
            className="rounded-2xl border border-white/[0.06] p-5"
            style={{
              background: "linear-gradient(145deg, #0f2438 0%, #0a1929 100%)",
              animation: "fadeUp .4s ease .08s both",
            }}
          >
            <p className="mb-3 text-xs font-semibold tracking-wider text-gray-600 uppercase">
              Asosiy ma'lumotlar
            </p>
            <div className="space-y-2">
              <InfoRow
                icon={Mail}
                label="Email"
                value={user.email}
                color="#3b82f6"
              />
              <InfoRow
                icon={Building2}
                label="Kompaniya"
                value={`ID: ${user.companyId}`}
                color="#8b5cf6"
              />
              <InfoRow
                icon={Key}
                label="Rol"
                value={roleInfo.label}
                color={roleInfo.color}
              />
              <InfoRow
                icon={Clock}
                label="Ro'yxatdan o'tgan"
                value={formatDate(user.createdAt)}
                color="#06b6d4"
              />
              <InfoRow
                icon={Clock}
                label="Yangilangan"
                value={formatDate(user.updateAt || user.updatedAt)}
                color="#6b7280"
              />
            </div>
          </div>

          {/* ── Ruxsatlar ─────────────────────────────────────────── */}
          {Object.keys(permission).length > 0 && (
            <div
              className="rounded-2xl border border-white/[0.06] p-5"
              style={{
                background: "linear-gradient(145deg, #0f2438 0%, #0a1929 100%)",
                animation: "fadeUp .4s ease .16s both",
              }}
            >
              <p className="mb-3 text-xs font-semibold tracking-wider text-gray-600 uppercase">
                Ruxsatlar
              </p>
              <div className="space-y-2">
                {Object.entries(permission)
                  .filter(([k]) => !k.startsWith("__"))
                  .map(([key, val]) => (
                    <PermBadge key={key} name={key} active={!!val} />
                  ))}
              </div>
            </div>
          )}

          {/* ── Logout ────────────────────────────────────────────── */}
          <div style={{ animation: "fadeUp .4s ease .24s both" }}>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-2xl border border-red-500/10 bg-red-500/5 px-5 py-4 text-sm font-medium text-red-400 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10">
                  <LogOut size={14} className="text-red-400" />
                </div>
                Hisobdan chiqish
              </div>
              <ChevronRight size={16} className="text-red-500/40" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}
