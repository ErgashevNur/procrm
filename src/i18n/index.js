import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import uz from "./locales/uz.json";
import ru from "./locales/ru.json";
import en from "./locales/en.json";
import zh from "./locales/zh.json";

export const LANGUAGE_MAP = {
  "O'zbek": "uz",
  "Русский": "ru",
  "English": "en",
  "中文": "zh",
};

export const LANGUAGE_DISPLAY = {
  uz: "O'zbek",
  ru: "Русский",
  en: "English",
  zh: "中文",
};

export const LANGUAGES = Object.keys(LANGUAGE_MAP);

function getInitialLanguage() {
  try {
    const raw = localStorage.getItem("userData");
    if (!raw) return "uz";
    const parsed = JSON.parse(raw);
    const langDisplay = parsed?.user?.language;
    if (langDisplay && LANGUAGE_MAP[langDisplay]) {
      return LANGUAGE_MAP[langDisplay];
    }
  } catch {}
  return "uz";
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      ru: { translation: ru },
      en: { translation: en },
      zh: { translation: zh },
    },
    lng: getInitialLanguage(),
    fallbackLng: "uz",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
