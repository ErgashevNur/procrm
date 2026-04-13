export default function Toast({ icon, msg, C }) {
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
