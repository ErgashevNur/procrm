import { useState } from "react";

export default function WebhookModal({ onClose, C }) {
  const [url, setUrl] = useState("");
  const [ev, setEv] = useState("Создание сделки");
  const inp = {
    width: "100%",
    background: "#1A2840",
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    outline: "none",
    color: C.text,
    fontFamily: "inherit",
    boxSizing: "border-box",
  };
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1A2840",
          borderRadius: 16,
          padding: 28,
          width: 440,
          border: `1px solid ${C.border}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 18,
            color: C.text,
            marginBottom: 6,
          }}
        >
          Добавить Web Hook
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20 }}>
          Настройте уведомления при событиях в CRM
        </div>
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: C.textMuted,
              marginBottom: 5,
            }}
          >
            URL назначения
          </div>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-server.com/webhook"
            style={inp}
          />
        </div>
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: C.textMuted,
              marginBottom: 5,
            }}
          >
            Событие
          </div>
          <select
            value={ev}
            onChange={(e) => setEv(e.target.value)}
            style={inp}
          >
            {[
              "Создание сделки",
              "Изменение сделки",
              "Удаление сделки",
              "Создание контакта",
              "Входящий звонок",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              background: "#243449",
              color: C.textMuted,
              border: "none",
              borderRadius: 9,
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Отмена
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: C.blue,
              color: "#fff",
              border: "none",
              borderRadius: 9,
              padding: "10px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Сохранить хук
          </button>
        </div>
      </div>
    </div>
  );
}
