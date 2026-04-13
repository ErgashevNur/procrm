const items = [
  "Kompaniya nomi va manager ma'lumoti",
  "Telefon, email va password yuborish",
  "Permission avtomatik CRM sifatida yuboriladi",
  "Logo bilan multipart/form-data jo'natish",
];

export default function RegisterInfoPanel() {
  return (
    <div
      style={{
        background: "rgba(11,16,24,.9)",
        border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 24,
        padding: 32,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 999,
          background: "rgba(14,165,233,.1)",
          border: "1px solid rgba(14,165,233,.2)",
          color: "#38bdf8",
          fontSize: 12,
          marginBottom: 18,
        }}
      >
        Public Register
      </div>

      <h1
        style={{
          fontSize: "clamp(2rem, 4vw, 3.3rem)",
          lineHeight: 1.05,
          fontWeight: 800,
          marginBottom: 14,
        }}
      >
        Kompaniyangizni
        <br />
        tizimga ulang
      </h1>

      <p
        style={{
          fontSize: 15,
          lineHeight: 1.8,
          color: "rgba(255,255,255,.55)",
          marginBottom: 28,
          maxWidth: 520,
        }}
      >
        Siz bergan `company/public` endpointiga mos ro'yxatdan o'tish formasi.
        So'rov faqat kerakli maydonlar bilan yuboriladi.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        {items.map((item) => (
          <div
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              borderRadius: 14,
              background: "#0f1724",
              border: "1px solid rgba(255,255,255,.06)",
              color: "rgba(255,255,255,.78)",
              fontSize: 14,
            }}
          >
            <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
