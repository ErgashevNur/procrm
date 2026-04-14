import IntCard from "./IntCard";

export default function Section({ title, count, items, onToggle, onSeeAll, C }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>
          {title}
        </span>
        <span
          onClick={onSeeAll}
          style={{
            color: C.blue,
            fontSize: 12,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Смотреть все ({count})
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
          gap: 14,
        }}
      >
        {items.map((i) => (
          <IntCard key={i.id} item={i} onToggle={onToggle} C={C} />
        ))}
      </div>
    </div>
  );
}
