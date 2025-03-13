import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import homeUK from "./locales/uk/home.json";
import homeEN from "./locales/en/home.json";
import foldersEN from "./locales/en/folders.json";
import foldersUK from "./locales/uk/folders.json";
import createsUK from "./locales/uk/create.json";
import createsEN from "./locales/en/create.json";
import recentEN from "./locales/en/recent.json";
import recentUK from "./locales/uk/recent.json";
import learnUK from "./locales/uk/learn.json";
import learnEN from "./locales/en/learn.json";


const resources = {
    en: {
      home: homeEN,
      recent: recentEN,
      folders: foldersEN,
      create: createsEN,
      learn: learnEN
    },
    uk: {
      home: homeUK,
      folders: foldersUK,
      create: createsUK,
      recent: recentUK,
      learn: learnUK
    },
  };

  i18n.use(initReactI18next).init({
    resources,
    lng: "uk",
    fallbackLng: "en",
    //ns: ["common", "home", "profile", "settings"],
    ns: [ "home","recent","folders"],
    //defaultNS: "common",
    interpolation: { escapeValue: false },
  });

export default i18n;
