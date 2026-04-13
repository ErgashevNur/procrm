export default function Badge({ type, C }) {
  const m = {
    free: {
      bg: "#0D3320",
      color: "#27AE60",
      border: "#1A5C3A",
      text: "Бесплатно",
    },
    new: {
      bg: "#0D1F40",
      color: "#4D8EF5",
      border: "#1A3A6E",
      text: "Новинка",
    },
    paid: {
      bg: "#2A1A00",
      color: "#F59E0B",
      border: "#5C3A00",
      text: "Платное",
    },
  };
  const s = m[type] || m.free;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {s.text}
    </span>
  );
}
