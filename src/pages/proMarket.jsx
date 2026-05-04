import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import {
  Bot,
  CheckCircle2,
  Lock,
  Package,
  Search,
  Settings as SettingsIcon,
  XCircle,
} from "lucide-react";
import RopAIConfigDialog from "@/components/proMarket/RopAIConfigDialog";
import LeadSyncDialog from "@/components/mijozlar/LeadSyncDialog";
import FacebookConfigDialog from "@/components/proMarket/FacebookConfigDialog";
import { apiUrl } from "@/lib/api";
import { getFacebookConnections } from "@/services/facebookService";

const C = {
  pageBg: "#1A2235",
  headerBg: "#162030",
  navBg: "#162030",
  cardBg: "#1E2D42",
  cardBorder: "#243449",
  blue: "#4D8EF5",
  text: "#FFFFFF",
  textMuted: "#8A9BB5",
  textDim: "#4A6080",
  border: "#243449",
  green: "#27AE60",
  red: "#E74C3C",
  purple: "#A855F7",
};
//test

function GoogleSheetsIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#0F9D58"
        d="M37 45H11a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h19l10 10v29a3 3 0 0 1-3 3z"
      />
      <path fill="#87CEAC" d="M30 13h10L30 3v10z" />
      <path
        fill="#F1F1F1"
        d="M31 23H17a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V24a1 1 0 0 0-1-1zm-7.5 12H18v-3h5.5v3zm0-5H18v-3h5.5v3zm0-5H18v-3h5.5v3zm6.5 10h-5.5v-3H30v3zm0-5h-5.5v-3H30v3zm0-5h-5.5v-3H30v3z"
      />
    </svg>
  );
}

const APPS = [
  {
    id: "facebook",
    name: "Facebook",
    faIcon: faFacebook,
    iconColor: "#1877F2",
    bg: "#1A2E50",
    desc: "Facebook Messenger orqali keladigan leadlarni CRMga ulang",
    badge: "free",
    installed: false,
  },
  {
    id: "instagram",
    name: "Instagram",
    faIcon: faInstagram,
    iconColor: "#E4405F",
    bg: "#3B1A2E",
    desc: "Instagram Direct xabarlarini bevosita CRMda boshqaring",
    badge: "free",
    installed: false,
  },
  {
    id: "rop-ai",
    name: "ROP AI",
    iconNode: Bot,
    iconColor: "#C084FC",
    bg: "#2A1840",
    desc: "Kelgan leadlarni avtomatik sales-managerlarga taqsimlaydi",
    badge: "beta",
    installed: false,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    faIcon: faWhatsapp,
    iconColor: "#25D366",
    bg: "#0D2B1D",
    desc: "WhatsApp Business orqali mijozlar bilan muloqot qiling",
    badge: "free",
    installed: false,
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    iconNode: GoogleSheetsIcon,
    bg: "#0D2B1D",
    desc: "Google Sheets bilan ikki tomonlama sinxronlash",
    badge: "free",
    installed: false,
  },
];

function BrandIcon({ item, size = 24 }) {
  if (item.iconNode) {
    const Icon = item.iconNode;
    return (
      <Icon size={size} color={item.iconColor || "#fff"} strokeWidth={1.8} />
    );
  }
  if (item.faIcon) {
    return (
      <FontAwesomeIcon
        icon={item.faIcon}
        style={{
          fontSize: size,
          color: item.iconColor || "#fff",
          display: "block",
        }}
      />
    );
  }
  return (
    <img
      src={item.logo}
      alt={`${item.name} logo`}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        borderRadius: Math.max(4, Math.floor(size / 4)),
      }}
    />
  );
}

const TABS = [
  { key: "all", label: "Barcha ilovalar" },
  { key: "installed", label: "O'rnatilgan" },
];

function ConnectedPill({ state = "disconnected" }) {
  const variants = {
    connected: {
      bg: "#0D3320",
      color: "#27AE60",
      border: "#1A5C3A",
      text: "Ulangan",
      glow: true,
    },
    paused: {
      bg: "#2A1A00",
      color: "#F59E0B",
      border: "#5C3A00",
      text: "Pauzada",
      glow: false,
    },
    disconnected: {
      bg: "#1A2235",
      color: "#8A9BB5",
      border: "#2E3D55",
      text: "Ulanmagan",
      glow: false,
    },
  };
  const s = variants[state] || variants.disconnected;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 20,
        fontSize: 9.5,
        fontWeight: 700,
        padding: "2px 7px",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        lineHeight: 1.2,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: s.color,
          boxShadow: s.glow ? `0 0 6px ${s.color}` : "none",
        }}
      />
      {s.text}
    </span>
  );
}

function IntCard({ item, onToggle }) {
  const [hov, setHov] = useState(false);
  const locked = !!item.locked;
  const interactive = !locked;
  const isRopAI = item.id === "rop-ai";
  const isSheets = item.id === "google-sheets";
  const isFacebook = item.id === "facebook";
  const isStateful = isRopAI || isSheets || isFacebook;
  const accent = locked
    ? C.purple
    : item.installed
      ? C.green
      : isRopAI
        ? C.purple
        : isSheets
          ? C.green
          : C.blue;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov && interactive ? "#243650" : C.cardBg,
        border: `1px solid ${hov && interactive ? "#2E4A6A" : C.cardBorder}`,
        borderRadius: 10,
        padding: 16,
        cursor: locked ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 10,
            background: item.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <BrandIcon item={item} size={24} />
          {locked && (
            <div
              style={{
                position: "absolute",
                bottom: -5,
                right: -5,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#0F1922",
                border: `1.5px solid ${C.purple}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
              }}
            >
              <Lock size={11} color={C.purple} strokeWidth={2.6} />
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          <ConnectedPill
            state={
              item.installed
                ? "connected"
                : item.configured
                  ? "paused"
                  : "disconnected"
            }
          />
        </div>
      </div>
      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: C.text,
            marginBottom: 4,
          }}
        >
          {item.name}
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>
          {item.desc}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (locked) return;
          onToggle(item.id);
        }}
        disabled={locked}
        style={{
          width: "100%",
          borderRadius: 7,
          padding: "7px 0",
          fontSize: 11,
          fontWeight: 700,
          cursor: locked ? "not-allowed" : "pointer",
          marginTop: "auto",
          border: `1.5px solid ${accent}`,
          background: "transparent",
          color: accent,
          transition: "all 0.18s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
        onMouseEnter={(e) => {
          if (locked) return;
          e.currentTarget.style.background = accent;
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          if (locked) return;
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = accent;
        }}
      >
        {locked ? (
          <>
            <Lock size={11} strokeWidth={2.6} /> Tez orada
          </>
        ) : isStateful ? (
          <>
            <SettingsIcon size={11} strokeWidth={2.6} />{" "}
            {item.installed ? "Sozlamalar" : "Sozlash"}
          </>
        ) : item.installed ? (
          "✓ Ulangan"
        ) : (
          "Ulash"
        )}
      </button>
    </div>
  );
}

function Toast({ icon, msg }) {
  const Icon = icon;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        background: "#0F1922",
        color: "#fff",
        padding: "12px 18px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 8,
        border: `1px solid ${C.border}`,
        boxShadow: "0 6px 24px rgba(0,0,0,0.5)",
        zIndex: 2000,
      }}
    >
      <Icon size={18} color="#fff" strokeWidth={2.2} />
      {msg}
    </div>
  );
}

export default function ProMarket() {
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState(
    APPS.reduce((a, i) => ({ ...a, [i.id]: { ...i } }), {}),
  );
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [srOpen, setSrOpen] = useState(false);
  const [ropDialogOpen, setRopDialogOpen] = useState(false);
  const [sheetsDialogOpen, setSheetsDialogOpen] = useState(false);
  const [fbDialogOpen, setFbDialogOpen] = useState(false);
  const projectId = Number(localStorage.getItem("projectId")) || 0;

  const refreshSheetsState = async () => {
    if (!projectId) return;
    const token = localStorage.getItem("user");
    try {
      const res = await fetch(apiUrl(`lead-sync/config/${projectId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const text = await res.text();
      if (!text) return;
      const payload = JSON.parse(text);
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.items)
            ? payload.items
            : [];
      const hasAny = list.length > 0;
      const hasActive = list.some((c) => c?.active ?? c?.isActive);
      setItems((prev) => ({
        ...prev,
        "google-sheets": {
          ...prev["google-sheets"],
          configured: hasAny,
          installed: hasActive,
        },
      }));
    } catch {
      // sukutda
    }
  };

  const refreshFacebookState = async () => {
    try {
      const connections = await getFacebookConnections();
      const hasActive = connections.some(
        (c) => c?.status === true || String(c?.status).toLowerCase() === "active",
      );
      setItems((prev) => ({
        ...prev,
        facebook: {
          ...prev.facebook,
          configured: connections.length > 0,
          installed: hasActive,
        },
      }));
    } catch {
      // sukutda
    }
  };

  useEffect(() => {
    if (!projectId) return;
    const token = localStorage.getItem("user");
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          apiUrl(
            `lead-distribution-config?projectId=${projectId}&page=1&limit=10`,
          ),
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok || cancelled) return;
        const text = await res.text();
        if (!text) return;
        const payload = JSON.parse(text);
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.items)
              ? payload.items
              : Array.isArray(payload?.results)
                ? payload.results
                : Array.isArray(payload?.data?.items)
                  ? payload.data.items
                  : [];
        const cfg = list[0];
        if (!cfg || cancelled) return;
        setItems((prev) => ({
          ...prev,
          "rop-ai": {
            ...prev["rop-ai"],
            configured: true,
            installed: !!cfg.isActive,
          },
        }));
      } catch {
        // sukutda — sahifa baribir yuklanaveradi
      }
    })();
    refreshSheetsState();
    refreshFacebookState();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const showToast = (icon, msg) => {
    setToast({ icon, msg });
    setTimeout(() => setToast(null), 2800);
  };

  const toggleInstall = (id) => {
    if (id === "rop-ai") {
      setRopDialogOpen(true);
      return;
    }
    if (id === "google-sheets") {
      setSheetsDialogOpen(true);
      return;
    }
    if (id === "facebook") {
      setFbDialogOpen(true);
      return;
    }
    setItems((prev) => {
      if (prev[id]?.locked) return prev;
      const was = prev[id].installed;
      showToast(
        was ? XCircle : CheckCircle2,
        was ? "Integratsiya o'chirildi" : "Integratsiya o'rnatildi!",
      );
      return { ...prev, [id]: { ...prev[id], installed: !was } };
    });
  };

  const handleRopAISaved = ({ isActive }) => {
    setItems((prev) => ({
      ...prev,
      "rop-ai": {
        ...prev["rop-ai"],
        configured: true,
        installed: !!isActive,
      },
    }));
    showToast(
      CheckCircle2,
      isActive ? "ROP AI yoqildi va sozlandi" : "ROP AI sozlamalari saqlandi",
    );
  };

  const handleFacebookSaved = () => {
    setItems((prev) => ({
      ...prev,
      facebook: { ...prev.facebook, configured: true, installed: true },
    }));
    showToast(CheckCircle2, "Facebook integratsiyasi sozlandi!");
  };

  const list = APPS.map((i) => items[i.id] || i);
  const installed = list.filter((i) => i.installed);

  const searchRes =
    search.trim().length > 1
      ? list
          .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 6)
      : [];

  const renderContent = () => {
    if (tab === "installed") {
      return (
        <div style={{ padding: "0 24px" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: C.text,
              marginBottom: 16,
            }}
          >
            O'rnatilgan{" "}
            <span style={{ color: C.textMuted, fontWeight: 500 }}>
              ({installed.length})
            </span>
          </div>
          {installed.length ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
                gap: 14,
              }}
            >
              {installed.map((i) => (
                <IntCard key={i.id} item={i} onToggle={toggleInstall} />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: C.textMuted,
              }}
            >
              <div style={{ marginBottom: 14 }}>
                <Package size={44} color={C.textMuted} strokeWidth={1.8} />
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  marginBottom: 6,
                  color: C.text,
                }}
              >
                O'rnatilgan integratsiya yo'q
              </div>
              <div style={{ fontSize: 13 }}>
                Katalogdan kerakli ilovani tanlang
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <div style={{ padding: "0 24px" }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: C.text,
            marginBottom: 16,
          }}
        >
          Barcha ilovalar{" "}
          <span style={{ color: C.textMuted, fontWeight: 500 }}>
            ({list.length})
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            gap: 14,
          }}
        >
          {list.map((i) => (
            <IntCard key={i.id} item={i} onToggle={toggleInstall} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: C.pageBg,
        fontFamily: "'Segoe UI',system-ui,sans-serif",
        overflow: "hidden",
        color: C.text,
      }}
    >
      <div
        style={{
          background: C.headerBg,
          borderBottom: `1px solid ${C.border}`,
          padding: "0 24px",
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontWeight: 900,
            fontSize: 16,
            color: C.text,
            letterSpacing: 0.3,
            whiteSpace: "nowrap",
          }}
        >
          Kotibam <span style={{ color: C.blue }}>MARKET</span>
        </span>
        <div style={{ position: "relative", maxWidth: 320, width: "100%" }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: C.textDim,
              fontSize: 14,
            }}
          >
            <Search size={14} color={C.textDim} strokeWidth={2.2} />
          </span>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSrOpen(true);
            }}
            onFocus={() => setSrOpen(true)}
            onBlur={() => setTimeout(() => setSrOpen(false), 150)}
            placeholder="Qidirish"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "7px 10px 7px 32px",
              color: C.text,
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {srOpen && searchRes.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                width: "100%",
                background: "#0F1922",
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                overflow: "hidden",
                zIndex: 500,
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              {searchRes.map((i) => (
                <div
                  key={i.id}
                  onMouseDown={() => {
                    setTab("all");
                    setSearch("");
                    setSrOpen(false);
                  }}
                  style={{
                    padding: "9px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BrandIcon item={i} size={18} />
                  </span>
                  <div>
                    <div
                      style={{ fontWeight: 600, fontSize: 13, color: C.text }}
                    >
                      {i.name}
                    </div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>
                      {i.installed
                        ? "Ulangan"
                        : i.configured
                          ? "Pauzada"
                          : "Ulanmagan"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }} />
      </div>

      <div
        style={{
          background: C.navBg,
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          overflowX: "auto",
          flexShrink: 0,
          scrollbarWidth: "none",
        }}
      >
        {TABS.map((t) => (
          <div
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "13px 14px",
              fontSize: 13,
              whiteSpace: "nowrap",
              cursor: "pointer",
              fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? C.blue : C.textMuted,
              borderBottom: `2px solid ${tab === t.key ? C.blue : "transparent"}`,
              transition: "color 0.15s",
            }}
          >
            {t.label}
          </div>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingTop: 24,
          paddingBottom: 32,
        }}
      >
        {renderContent()}
      </div>

      {toast && <Toast icon={toast.icon} msg={toast.msg} />}

      <RopAIConfigDialog
        open={ropDialogOpen}
        onOpenChange={setRopDialogOpen}
        onSaved={handleRopAISaved}
      />

      <LeadSyncDialog
        open={sheetsDialogOpen}
        onOpenChange={(open) => {
          setSheetsDialogOpen(open);
          if (!open) refreshSheetsState();
        }}
        projectId={projectId}
        onImportDone={() => {
          showToast(CheckCircle2, "Leadlar import qilindi");
          refreshSheetsState();
        }}
      />

      <FacebookConfigDialog
        open={fbDialogOpen}
        onOpenChange={(open) => {
          setFbDialogOpen(open);
          if (!open) refreshFacebookState();
        }}
        onSaved={handleFacebookSaved}
      />
    </div>
  );
}
