import { useState } from "react";
import BrandIcon from "./BrandIcon";
import Badge from "./Badge";

export default function IntCard({ item, onToggle, C }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#243650" : C.cardBg,
        border: `1px solid ${hov ? "#2E4A6A" : C.cardBorder}`,
        borderRadius: 10,
        padding: 14,
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
      }}
    >
      {item.installed && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 7,
            height: 7,
            background: C.green,
            borderRadius: "50%",
          }}
        />
      )}
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
          }}
        >
          <BrandIcon item={item} size={24} />
        </div>
        <Badge type={item.badge} C={C} />
      </div>
      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 12,
            color: C.text,
            marginBottom: 4,
          }}
        >
          {item.name}
        </div>
        <div style={{ fontSize: 10.5, color: C.textMuted, lineHeight: 1.5 }}>
          {item.desc}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(item.id);
        }}
        style={{
          width: "100%",
          borderRadius: 7,
          padding: "7px 0",
          fontSize: 10.5,
          fontWeight: 700,
          cursor: "pointer",
          marginTop: "auto",
          border: `1.5px solid ${item.installed ? C.green : C.blue}`,
          background: "transparent",
          color: item.installed ? C.green : C.blue,
          transition: "all 0.18s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = item.installed ? C.green : C.blue;
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = item.installed ? C.green : C.blue;
        }}
      >
        {item.installed ? "✓ Установлено" : "Установить бесплатно"}
      </button>
    </div>
  );
}
