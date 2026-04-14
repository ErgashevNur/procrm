import { Ellipsis } from "lucide-react";

export default function ProMarketTabs({ C, TABS, tab, setTab }) {
  return (
    <div
      style={{
        background: C.navBg,
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
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
            padding: "12px 10px",
            fontSize: 12,
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
      <div
        style={{
          padding: "12px 8px",
          fontSize: 16,
          color: C.textMuted,
          cursor: "pointer",
        }}
      >
        <Ellipsis size={16} color={C.textMuted} />
      </div>
    </div>
  );
}
