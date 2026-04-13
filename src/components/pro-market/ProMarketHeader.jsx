import { Ellipsis, Search } from "lucide-react";
import BrandIcon from "./BrandIcon";

export default function ProMarketHeader({
  C,
  search,
  setSearch,
  setSrOpen,
  srOpen,
  searchRes,
  setTab,
  setWebhook,
}) {
  return (
    <div
      style={{
        background: C.headerBg,
        borderBottom: `1px solid ${C.border}`,
        padding: "10px 16px",
        minHeight: 52,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
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
        Kotibam <span style={{ color: C.blue }}>МАРКЕТ</span>
      </span>
      <div
        style={{
          position: "relative",
          maxWidth: 320,
          width: "100%",
          flex: "1 1 220px",
          order: 3,
        }}
      >
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
          placeholder="Поиск"
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
                  (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
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
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>
                    {i.name}
                  </div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>
                    {i.badge === "free"
                      ? "Бесплатно"
                      : i.badge === "paid"
                        ? "Платное"
                        : "Новинка"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }} />
      <span
        style={{
          color: C.textMuted,
          cursor: "pointer",
          fontSize: 18,
          letterSpacing: 2,
          padding: "2px 8px",
          marginLeft: "auto",
        }}
      >
        <Ellipsis size={18} color={C.textMuted} />
      </span>
      <button
        onClick={() => setWebhook(true)}
        style={{
          background: "transparent",
          color: C.text,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: "7px 12px",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.blue)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
      >
        + WEB HOOKS
      </button>
    </div>
  );
}
