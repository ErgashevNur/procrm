import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faGoogle,
  faInstagram,
  faMailchimp,
  faTelegram,
  faViber,
  faVk,
  faWhatsapp,
  faYandex,
} from "@fortawesome/free-brands-svg-icons";
import {
  CheckCircle2,
  Ellipsis,
  Link2,
  Package,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";

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
};

const brandLogo = () => null;

function getBrandInitials(name = "") {
  const tokens = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!tokens.length) return "PK";

  return tokens
    .slice(0, 2)
    .map((token) => token[0] || "")
    .join("")
    .toUpperCase();
}

const INTEGRATIONS = {
  chats: [
    {
      id: "telegram",
      name: "Telegram",
      faIcon: faTelegram,
      iconColor: "#24A1DE",
      bg: "#1B3A5C",
      desc: "Получайте и отправляйте сообщения из Telegram прямо в CRM",
      badge: "free",
      installed: true,
    },
    {
      id: "instagram",
      name: "Instagram",
      faIcon: faInstagram,
      iconColor: "#E4405F",
      bg: "#3B1A2E",
      desc: "Директ Instagram к сделкам и контактам",
      badge: "free",
      installed: false,
    },
    {
      id: "facebook",
      name: "Facebook",
      faIcon: faFacebook,
      iconColor: "#1877F2",
      bg: "#1A2E50",
      desc: "Мессенджер Facebook — все чаты в одном окне",
      badge: "free",
      installed: false,
    },
    {
      id: "google",
      name: "Google",
      faIcon: faGoogle,
      iconColor: "#4285F4",
      bg: "#2A2A1A",
      desc: "Google Business Messages интеграция",
      badge: "free",
      installed: false,
    },
    {
      id: "vk",
      name: "VK",
      faIcon: faVk,
      iconColor: "#0077FF",
      bg: "#1A2A45",
      desc: "Сообщения из групп и личных сообщений ВКонтакте",
      badge: "free",
      installed: false,
    },
    {
      id: "avito",
      name: "Avito",
      logo: brandLogo("avito.ru"),
      bg: "#2A1F10",
      desc: "Объявления и чаты Avito — всё в CRM",
      badge: "new",
      installed: false,
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      faIcon: faWhatsapp,
      iconColor: "#25D366",
      bg: "#0D2B1D",
      desc: "WhatsApp Business API — официальная интеграция",
      badge: "paid",
      installed: false,
    },
    {
      id: "viber",
      name: "Viber",
      faIcon: faViber,
      iconColor: "#7360F2",
      bg: "#220E3A",
      desc: "Интеграция Viber для бизнеса",
      badge: "free",
      installed: false,
    },
  ],
  telephony: [
    {
      id: "mango",
      name: "Манго Телеком",
      logo: brandLogo("mango-office.ru"),
      bg: "#0D2B1D",
      desc: "Виртуальная АТС с записью звонков",
      badge: "paid",
      installed: false,
    },
    {
      id: "sipuni",
      name: "Sipuni",
      logo: brandLogo("sipuni.com"),
      bg: "#1A2E50",
      desc: "Облачная телефония для отдела продаж",
      badge: "free",
      installed: false,
    },
    {
      id: "binotel",
      name: "Binotel",
      logo: brandLogo("binotel.ua"),
      bg: "#3B1A2E",
      desc: "IP-телефония и аналитика звонков",
      badge: "paid",
      installed: false,
    },
    {
      id: "uiscom",
      name: "UIS",
      logo: brandLogo("uiscom.ru"),
      bg: "#2A2010",
      desc: "Коллтрекинг и виртуальная АТС",
      badge: "free",
      installed: true,
    },
    {
      id: "zadarma",
      name: "Zadarma",
      logo: brandLogo("zadarma.com"),
      bg: "#1E1040",
      desc: "Бесплатная АТС при пополнении баланса",
      badge: "free",
      installed: false,
    },
    {
      id: "kotibamphone",
      name: "Kotibam CRM Phone",
      logo: brandLogo("Kotibam crm.com"),
      bg: "#1A3040",
      desc: "Встроенная телефония от Kotibam CRM",
      badge: "new",
      installed: false,
    },
  ],
  email: [
    {
      id: "unisender",
      name: "UniSender",
      logo: brandLogo("unisender.com"),
      bg: "#0D2B1D",
      desc: "Email и SMS рассылки с сегментацией",
      badge: "free",
      installed: false,
    },
    {
      id: "sendpulse",
      name: "SendPulse",
      logo: brandLogo("sendpulse.com"),
      bg: "#1A2E50",
      desc: "Омниканальный маркетинг: email, SMS, Push",
      badge: "free",
      installed: false,
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      faIcon: faMailchimp,
      iconColor: "#FFE01B",
      bg: "#3B1A2E",
      desc: "Профессиональные email-кампании",
      badge: "free",
      installed: false,
    },
    {
      id: "getresponse",
      name: "GetResponse",
      logo: brandLogo("getresponse.com"),
      bg: "#1E1040",
      desc: "Автоворонки и email маркетинг",
      badge: "paid",
      installed: false,
    },
    {
      id: "smsint",
      name: "SMS Интеграл",
      logo: brandLogo("smsint.ru"),
      bg: "#2A2010",
      desc: "SMS рассылки по базе клиентов",
      badge: "paid",
      installed: false,
    },
  ],
  billing: [
    {
      id: "tochka",
      name: "Точка",
      logo: brandLogo("tochka.com"),
      bg: "#0D2B1D",
      desc: "Эквайринг от банка Точка прямо в Kotibam CRM",
      badge: "free",
      installed: false,
    },
    {
      id: "sber",
      name: "СберБизнес",
      logo: brandLogo("sberbank.ru"),
      bg: "#1A2E50",
      desc: "Онлайн-оплата через Сбер",
      badge: "paid",
      installed: false,
    },
    {
      id: "tinkoff",
      name: "Т-Банк",
      logo: brandLogo("tbank.ru"),
      bg: "#2A2010",
      desc: "Выставление счетов через Тинькофф",
      badge: "free",
      installed: false,
    },
    {
      id: "yookassa",
      name: "ЮKassa",
      logo: brandLogo("yookassa.ru"),
      bg: "#3B1A2E",
      desc: "Приём платежей от Яндекса",
      badge: "free",
      installed: false,
    },
  ],
  analytics: [
    {
      id: "roistat",
      name: "Roistat",
      logo: brandLogo("roistat.com"),
      bg: "#0D2B1D",
      desc: "Сквозная аналитика и ROI по каналам",
      badge: "paid",
      installed: true,
    },
    {
      id: "calltouch",
      name: "Calltouch",
      logo: brandLogo("calltouch.ru"),
      bg: "#1A2E50",
      desc: "Коллтрекинг и сквозная аналитика",
      badge: "paid",
      installed: false,
    },
    {
      id: "yametrika",
      name: "Яндекс.Метрика",
      faIcon: faYandex,
      iconColor: "#FC3F1D",
      bg: "#2A2010",
      desc: "Цели и конверсии из Kotibam CRM в Метрику",
      badge: "free",
      installed: false,
    },
    {
      id: "ga4",
      name: "Google Analytics 4",
      logo: brandLogo("analytics.google.com"),
      bg: "#3B1A2E",
      desc: "Передача событий в GA4 из CRM",
      badge: "free",
      installed: false,
    },
  ],
  docs: [
    {
      id: "diadoc",
      name: "Диадок",
      logo: brandLogo("diadoc.kontur.ru"),
      bg: "#0D2B1D",
      desc: "Электронный документооборот",
      badge: "paid",
      installed: false,
    },
    {
      id: "elba",
      name: "Эльба",
      logo: brandLogo("e-kontur.ru"),
      bg: "#1A2E50",
      desc: "Онлайн-бухгалтерия и документы",
      badge: "free",
      installed: false,
    },
    {
      id: "kontur",
      name: "Контур.Фокус",
      logo: brandLogo("focus.kontur.ru"),
      bg: "#2A2010",
      desc: "Проверка контрагентов",
      badge: "paid",
      installed: false,
    },
  ],
  retail: [
    {
      id: "yclients",
      name: "YCLIENTS",
      logo: brandLogo("yclients.com"),
      bg: "#1A2E50",
      desc: "Онлайн-запись для сферы услуг",
      badge: "free",
      installed: false,
    },
    {
      id: "moysklad",
      name: "МойСклад",
      logo: brandLogo("moysklad.ru"),
      bg: "#0D2B1D",
      desc: "Складской учёт и торговля",
      badge: "free",
      installed: false,
    },
    {
      id: "c1",
      name: "1С:CRM",
      logo: brandLogo("1c.ru"),
      bg: "#2A2010",
      desc: "Синхронизация с 1С Предприятие",
      badge: "paid",
      installed: false,
    },
  ],
};

const ALL_ITEMS = Object.values(INTEGRATIONS).flat();

function BrandIcon({ item, size = 24 }) {
  const initials = useMemo(() => getBrandInitials(item?.name), [item?.name]);

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
    <div
      aria-label={`${item.name} logo`}
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        borderRadius: Math.max(4, Math.floor(size / 4)),
        background:
          "linear-gradient(135deg, rgba(77,142,245,0.24), rgba(39,174,96,0.22))",
        color: "#D9E8FF",
        fontSize: Math.max(10, Math.floor(size * 0.38)),
        fontWeight: 700,
        letterSpacing: "0.04em",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {initials}
    </div>
  );
}

const TABS = [
  { key: "installed", label: "Установленные" },
  { key: "all", label: "Выбор Kotibam CRM" },
  { key: "chats", label: "Чаты и мессенджеры" },
  { key: "telephony", label: "Телефония" },
  { key: "email", label: "Email и SMS рассылки" },
  { key: "billing", label: "Счета и эквайринг" },
  { key: "analytics", label: "Аналитика" },
  { key: "docs", label: "Работа с документами" },
  { key: "retail", label: "Розница" },
];

const SLIDES = [
  {
    id: 0,
    bg: "linear-gradient(135deg,#1A3060 0%,#1E4880 50%,#1A3060 100%)",
    title: "№1 приложение\nдля звонков",
    body: "Создано специально под задачи менеджеров.",
    label: "Звонки Pro",
    sublabel: "Телефония",
  },
  {
    id: 1,
    bg: "linear-gradient(135deg,#1565C0 0%,#1976D2 40%,#1E88E5 100%)",
    maobot: true,
    label: "Мао Бот",
    sublabel: "Чаты и продажи",
  },
  {
    id: 2,
    bg: "linear-gradient(135deg,#1B3A2A 0%,#1E5035 50%,#145C35 100%)",
    title: "Подключи эквайринг\nпрямо сейчас.\nС Точкой легко!",
    body: "Подключите эквайринг в Kotibam CRM за пару простых шагов и начинайте принимать оплату.",
    cta: "Подключить",
    ctaOutline: true,
    label: "Точка",
    sublabel: "Счета и эквайринг",
  },
];

/* ── Badge ── */
function Badge({ type }) {
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

/* ── IntCard ── */
function IntCard({ item, onToggle, compact = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#243650" : C.cardBg,
        border: `1px solid ${hov ? "#2E4A6A" : C.cardBorder}`,
        borderRadius: 10,
        padding: compact ? 14 : 16,
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
          width: compact ? 42 : 46,
          height: compact ? 42 : 46,
            borderRadius: 10,
            background: item.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BrandIcon item={item} size={compact ? 22 : 24} />
        </div>
        <Badge type={item.badge} />
      </div>
      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: compact ? 12 : 13,
            color: C.text,
            marginBottom: 4,
          }}
        >
          {item.name}
        </div>
        <div style={{ fontSize: compact ? 10.5 : 11, color: C.textMuted, lineHeight: 1.5 }}>
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
          padding: compact ? "8px 0" : "7px 0",
          fontSize: compact ? 10.5 : 11,
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

/* ── Slider ── */
function Slider({ isMobile = false }) {
  const [cur, setCur] = useState(1);
  const prev = () => setCur((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCur((c) => (c + 1) % SLIDES.length);
  const left = SLIDES[(cur - 1 + SLIDES.length) % SLIDES.length];
  const center = SLIDES[cur];
  const right = SLIDES[(cur + 1) % SLIDES.length];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "18px 0 30px" : "28px 0 36px",
        background: C.pageBg,
        overflow: "hidden",
      }}
    >
      {/* Left ghost */}
      {!isMobile && (
        <div
          style={{
            position: "absolute",
            left: 0,
            width: "20%",
            height: 260,
            background: left.bg,
            borderRadius: "0 14px 14px 0",
            opacity: 0.5,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            padding: "20px 18px",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            {(left.title || left.label || "").split("\n")[0]}
          </div>
        </div>
      )}

      {/* Left arrow */}
      <button
        onClick={prev}
        style={{
          position: "absolute",
          left: isMobile ? 10 : "20%",
          zIndex: 10,
          width: isMobile ? 30 : 34,
          height: isMobile ? 30 : 34,
          borderRadius: "50%",
          background: "rgba(15,25,40,0.9)",
          border: `1px solid ${C.border}`,
          color: "#fff",
          fontSize: isMobile ? 16 : 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
        }}
      >
        ‹
      </button>

      {/* Center */}
      <div
        style={{
          width: isMobile ? "calc(100% - 76px)" : "56%",
          maxWidth: 800,
          minHeight: isMobile ? 300 : 260,
          background: center.bg,
          borderRadius: 14,
          position: "relative",
          overflow: "hidden",
          zIndex: 5,
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}
      >
        {center.maobot ? (
          <MaoBotSlide slide={center} isMobile={isMobile} />
        ) : (
          <GenericSlide slide={center} isMobile={isMobile} />
        )}
      </div>

      {/* Right arrow */}
      <button
        onClick={next}
        style={{
          position: "absolute",
          right: isMobile ? 10 : "20%",
          zIndex: 10,
          width: isMobile ? 30 : 34,
          height: isMobile ? 30 : 34,
          borderRadius: "50%",
          background: "rgba(15,25,40,0.9)",
          border: `1px solid ${C.border}`,
          color: "#fff",
          fontSize: isMobile ? 16 : 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
        }}
      >
        ›
      </button>

      {/* Right ghost */}
      {!isMobile && (
        <div
          style={{
            position: "absolute",
            right: 0,
            width: "20%",
            height: 260,
            background: right.bg,
            borderRadius: "14px 0 0 14px",
            opacity: 0.5,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            padding: "20px 18px",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            {(right.title || right.label || "").split("\n")[0]}
          </div>
        </div>
      )}

      {/* Dots */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 6,
        }}
      >
        {SLIDES.map((_, i) => (
          <div
            key={i}
            onClick={() => setCur(i)}
            style={{
              width: i === cur ? 22 : 6,
              height: 6,
              borderRadius: 3,
              background: i === cur ? "#fff" : "rgba(255,255,255,0.3)",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MaoBotSlide({ slide, isMobile = false }) {
  return (
    <div
      style={{
        padding: isMobile ? "22px 18px 60px" : "28px 32px 60px",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: isMobile ? 18 : 0,
        minHeight: isMobile ? 300 : 260,
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
            fontSize: isMobile ? 20 : 24,
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
      <div style={{ marginLeft: isMobile ? 0 : 24, flexShrink: 0, alignSelf: isMobile ? "flex-start" : "auto" }}>
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
      {/* CTA bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(41,121,255,0.88)",
          borderRadius: "0 0 14px 14px",
          padding: isMobile ? "12px 14px" : "13px",
          textAlign: "center",
          cursor: "pointer",
          color: "#fff",
          fontWeight: 700,
          fontSize: isMobile ? 13 : 14,
        }}
      >
        Подключить тестовый период на 3 дня
      </div>
    </div>
  );
}

function GenericSlide({ slide, isMobile = false }) {
  return (
    <div
      style={{
        padding: isMobile ? "22px 18px" : "28px 32px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: isMobile ? 300 : 260,
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🏦
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>
              {slide.label}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
              {slide.sublabel}
            </div>
          </div>
        </div>
        <div
          style={{
            fontWeight: 900,
            fontSize: isMobile ? 18 : 20,
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.3,
            marginBottom: 10,
          }}
        >
          {(slide.title || "").split("\n").map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        <div
          style={{
            fontSize: isMobile ? 11 : 12,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.6,
            maxWidth: isMobile ? "100%" : 400,
          }}
        >
          {slide.body}
        </div>
      </div>
      {slide.cta && (
        <button
          style={{
            marginTop: 18,
            background: slide.ctaOutline ? "rgba(255,255,255,0.12)" : "#4D8EF5",
            border: slide.ctaOutline
              ? "1px solid rgba(255,255,255,0.25)"
              : "none",
            color: "#fff",
            borderRadius: 9,
            padding: isMobile ? "10px 18px" : "10px 22px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
        >
          {slide.cta}
        </button>
      )}
    </div>
  );
}

/* ── Section ── */
function Section({ title, count, items, onToggle, onSeeAll, isMobile = false }) {
  return (
    <div style={{ marginBottom: isMobile ? 28 : 36 }}>
      <div
        style={{
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 6 : 12,
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
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(auto-fill,minmax(200px,1fr))",
          gap: isMobile ? 12 : 14,
        }}
      >
        {items.map((i) => (
          <IntCard key={i.id} item={i} onToggle={onToggle} compact={isMobile} />
        ))}
      </div>
    </div>
  );
}

/* ── Webhook Modal ── */
function WebhookModal({ onClose }) {
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

/* ── Toast ── */
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

/* ── MAIN ── */
export default function ProMarket() {
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState(
    ALL_ITEMS.reduce((a, i) => ({ ...a, [i.id]: { ...i } }), {}),
  );
  const [webhook, setWebhook] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [srOpen, setSrOpen] = useState(false);
  const [vpWidth, setVpWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );

  useEffect(() => {
    const onResize = () => setVpWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = vpWidth < 768;
  const contentPadX = isMobile ? 14 : 24;

  const showToast = (icon, msg) => {
    setToast({ icon, msg });
    setTimeout(() => setToast(null), 2800);
  };
  const toggleInstall = (id) =>
    setItems((prev) => {
      const was = prev[id].installed;
      showToast(
        was ? XCircle : CheckCircle2,
        was ? "Интеграция удалена" : "Интеграция установлена!",
      );
      return { ...prev, [id]: { ...prev[id], installed: !was } };
    });

  const catItems = (cat) =>
    (INTEGRATIONS[cat] || []).map((i) => items[i.id] || i);
  const searchRes =
    search.trim().length > 1
      ? ALL_ITEMS.filter((i) =>
          i.name.toLowerCase().includes(search.toLowerCase()),
        ).slice(0, 6)
      : [];

  const renderContent = () => {
    if (tab === "installed") {
      const inst = Object.values(items).filter((i) => i.installed);
      return (
        <div style={{ padding: `0 ${contentPadX}px` }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: C.text,
              marginBottom: 16,
            }}
          >
            Установленные{" "}
            <span style={{ color: C.textMuted, fontWeight: 500 }}>
              ({inst.length})
            </span>
          </div>
          {inst.length ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fill,minmax(200px,1fr))",
                gap: isMobile ? 12 : 14,
              }}
            >
              {inst.map((i) => (
                <IntCard key={i.id} item={i} onToggle={toggleInstall} compact={isMobile} />
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
                Нет установленных интеграций
              </div>
              <div style={{ fontSize: 13 }}>
                Перейдите в каталог и выберите нужные
              </div>
            </div>
          )}
        </div>
      );
    }
    if (tab === "all")
      return (
        <>
          <Slider isMobile={isMobile} />
          <div style={{ padding: `0 ${contentPadX}px` }}>
            <Section
              title="Чаты и мессенджеры"
              count={330}
              items={catItems("chats")}
              onToggle={toggleInstall}
              onSeeAll={() => setTab("chats")}
              isMobile={isMobile}
            />
            <Section
              title="Телефония"
              count={47}
              items={catItems("telephony")}
              onToggle={toggleInstall}
              onSeeAll={() => setTab("telephony")}
              isMobile={isMobile}
            />
            <Section
              title="Email и SMS рассылки"
              count={28}
              items={catItems("email")}
              onToggle={toggleInstall}
              onSeeAll={() => setTab("email")}
              isMobile={isMobile}
            />
            <Section
              title="Аналитика"
              count={22}
              items={catItems("analytics")}
              onToggle={toggleInstall}
              onSeeAll={() => setTab("analytics")}
              isMobile={isMobile}
            />
          </div>
        </>
      );
    const meta = {
      chats: { title: "Чаты и мессенджеры", count: 330 },
      telephony: { title: "Телефония", count: 47 },
      email: { title: "Email и SMS рассылки", count: 28 },
      billing: { title: "Счета и эквайринг", count: 15 },
      analytics: { title: "Аналитика", count: 22 },
      docs: { title: "Работа с документами", count: 18 },
      retail: { title: "Розница", count: 12 },
    }[tab] || { title: tab, count: 0 };
    const ci = catItems(tab);
    return (
      <div style={{ padding: `0 ${contentPadX}px` }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: C.text,
            marginBottom: 16,
          }}
        >
          {meta.title}{" "}
          <span style={{ color: C.textMuted, fontWeight: 500 }}>
            ({meta.count})
          </span>
        </div>
        {ci.length ? (
          <div
            style={{
            display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fill,minmax(200px,1fr))",
              gap: isMobile ? 12 : 14,
            }}
          >
            {ci.map((i) => (
              <IntCard key={i.id} item={i} onToggle={toggleInstall} compact={isMobile} />
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
            <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>
              Раздел в разработке
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: C.pageBg,
        fontFamily: "'Segoe UI',system-ui,sans-serif",
        overflow: isMobile ? "visible" : "hidden",
        color: C.text,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: C.headerBg,
          borderBottom: `1px solid ${C.border}`,
          padding: isMobile ? "10px 14px" : "0 24px",
          minHeight: isMobile ? 96 : 52,
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          flexWrap: isMobile ? "wrap" : "nowrap",
          gap: isMobile ? 10 : 16,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontWeight: 900,
            fontSize: isMobile ? 15 : 16,
            color: C.text,
            letterSpacing: 0.3,
            whiteSpace: "nowrap",
          }}
        >
          Kotibam <span style={{ color: C.blue }}>МАРКЕТ</span>
        </span>
        <div style={{ position: "relative", maxWidth: isMobile ? "100%" : 320, width: isMobile ? "100%" : "100%", order: isMobile ? 3 : 0 }}>
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
        <div style={{ flex: 1, display: isMobile ? "none" : "block" }} />
        <span
          style={{
            color: C.textMuted,
            cursor: "pointer",
            fontSize: 18,
            letterSpacing: 2,
            padding: "2px 8px",
            marginLeft: isMobile ? "auto" : 0,
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
            padding: isMobile ? "7px 12px" : "7px 14px",
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

      {/* NAV TABS */}
      <div
        style={{
          background: C.navBg,
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          padding: `0 ${contentPadX}px`,
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
        <div
          style={{
            padding: "13px 10px",
            fontSize: 16,
            color: C.textMuted,
            cursor: "pointer",
          }}
        >
          <Ellipsis size={16} color={C.textMuted} />
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: isMobile ? 24 : 32 }}>
        {renderContent()}
      </div>

      {webhook && (
        <WebhookModal
          onClose={() => {
            setWebhook(false);
            showToast(Link2, "Хук сохранён!");
          }}
        />
      )}
      {toast && <Toast icon={toast.icon} msg={toast.msg} />}
    </div>
  );
}
