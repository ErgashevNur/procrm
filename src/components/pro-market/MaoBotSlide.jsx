export default function MaoBotSlide({ slide, C }) {
  return (
    <div
      style={{
        padding: "clamp(18px, 4vw, 32px) clamp(18px, 4vw, 32px) 60px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        minHeight: 220,
        flexWrap: "wrap",
        gap: 18,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>
              {slide.label}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
              {slide.sublabel}
            </div>
          </div>
        </div>
        <div
          style={{
            fontWeight: 900,
            fontSize: "clamp(17px, 4.5vw, 24px)",
            color: "#fff",
            lineHeight: 1.3,
            marginBottom: 16,
          }}
        >
          Продавайте в Telegram, Max,
          <br />
          WhatsApp, Avito без переплат
        </div>
        {[
          {
            bold: "Пишите первыми без лимитов",
            rest: "на сообщения и ограничений на диалоги",
          },
          {
            bold: "Нейропродавец",
            tag: "NEW",
            rest: "вернет упущенную прибыль",
          },
        ].map((f, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                background: "#90CAF9",
                borderRadius: "50%",
                marginTop: 5,
                flexShrink: 0,
              }}
            />
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
              <strong style={{ color: "#fff" }}>{f.bold}</strong>
              {f.tag && (
                <span
                  style={{
                    background: C.red,
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "1px 5px",
                    borderRadius: 4,
                    marginLeft: 5,
                    marginRight: 3,
                  }}
                >
                  {f.tag}
                </span>
              )}{" "}
              {f.rest}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginLeft: "auto", flexShrink: 0 }}>
        <div
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 12,
            padding: "10px 20px",
            textAlign: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>от</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>
            1650₽ / мес
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
            за 2 мессенджера
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(41,121,255,0.88)",
          borderRadius: "0 0 14px 14px",
          padding: "13px",
          textAlign: "center",
          cursor: "pointer",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        Подключить тестовый период на 3 дня
      </div>
    </div>
  );
}
