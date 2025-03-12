import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import homeUK from "./locales/uk/home.json";
import homeEN from "./locales/en/home.json";
import recentEN from "./locales/en/recent.json";
import recentUK from "./locales/uk/recent.json";

const resources = {
    en: {
      //common: commonEN,
      home: homeEN,
      recent: recentEN,
      //profile: profileEN,
      //settings: settingsEN,
    },
    uk: {
      //common: commonUK,
      home: homeUK,
      //profile: profileUK,
      //settings: settingsUK,
      recent: recentUK,
    },
  };

  i18n.use(initReactI18next).init({
    resources,
    lng: "uk",
    fallbackLng: "en",
    //ns: ["common", "home", "profile", "settings"], // Використовуємо простори імен (namespaces)
    ns: [ "home","recent"],
    //defaultNS: "common",
    interpolation: { escapeValue: false },
  });

export default i18n;
