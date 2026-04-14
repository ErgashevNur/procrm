import { useState } from "react";
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
  Link2,
  Package,
  Wallet,
  XCircle,
} from "lucide-react";
import IntCard from "@/components/pro-market/IntCard";
import Slider from "@/components/pro-market/Slider";
import Section from "@/components/pro-market/Section";
import WebhookModal from "@/components/pro-market/WebhookModal";
import Toast from "@/components/pro-market/Toast";
import ProMarketHeader from "@/components/pro-market/ProMarketHeader";
import ProMarketTabs from "@/components/pro-market/ProMarketTabs";

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

const brandLogo = (domain) => {
  const label = String(domain || "")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .trim();

  const text = (label[0] || "?").toUpperCase();
  const colors = [
    ["#244C7A", "#4D8EF5"],
    ["#2A3E2A", "#27AE60"],
    ["#5A2D2D", "#E67E22"],
    ["#3F2A56", "#9B59B6"],
    ["#2B4558", "#3AA6D0"],
  ];

  const hash = [...label].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const [bg, fg] = colors[hash % colors.length];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect width="128" height="128" rx="28" fill="${bg}"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        fill="${fg}" font-family="Arial, sans-serif" font-size="64" font-weight="700">${text}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

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
        <div style={{ padding: "0 16px" }}>
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
                gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
                gap: 14,
              }}
            >
              {inst.map((i) => (
                <IntCard key={i.id} item={i} onToggle={toggleInstall} C={C} />
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
          <Slider SLIDES={SLIDES} C={C} />
          <div style={{ padding: "0 16px" }}>
            <Section
              title="Чаты и мессенджеры"
              count={330}
              items={catItems("chats")}
              onToggle={toggleInstall}
              onSeeAll={() => setTab("chats")}
              C={C}
            />
            <Section
              title="Телефония"
              count={47}
              items={catItems("telephony")}
              onToggle={toggleInstall}
              onSeeAll={() => setTab("telephony")}
              C={C}
            />
            <Section
              title="Email и SMS рассылки"
              count={28}
              items={catItems("email")}
              onToggle={toggleInstall}
              onSeeAll={() => setTab("email")}
              C={C}
            />
            <Section
              title="Аналитика"
              count={22}
              items={catItems("analytics")}
              onToggle={toggleInstall}
              onSeeAll={() => setTab("analytics")}
              C={C}
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
      <div style={{ padding: "0 16px" }}>
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
              gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
              gap: 14,
            }}
          >
            {ci.map((i) => (
              <IntCard key={i.id} item={i} onToggle={toggleInstall} C={C} />
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
        height: "100vh",
        background: C.pageBg,
        fontFamily: "'Segoe UI',system-ui,sans-serif",
        overflow: "hidden",
        color: C.text,
      }}
    >
      <ProMarketHeader
        C={C}
        search={search}
        setSearch={setSearch}
        setSrOpen={setSrOpen}
        srOpen={srOpen}
        searchRes={searchRes}
        setTab={setTab}
        setWebhook={setWebhook}
      />

      <ProMarketTabs C={C} TABS={TABS} tab={tab} setTab={setTab} />

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 32 }}>
        {renderContent()}
      </div>

      {webhook && (
        <WebhookModal
          C={C}
          onClose={() => {
            setWebhook(false);
            showToast(Link2, "Хук сохранён!");
          }}
        />
      )}
      {toast && <Toast icon={toast.icon} msg={toast.msg} C={C} />}
    </div>
  );
}
