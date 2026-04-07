import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enBoard from "./locales/en/board.json";
import enCommon from "./locales/en/common.json";
import enDetail from "./locales/en/detail.json";
import enErrors from "./locales/en/errors.json";
import enSettings from "./locales/en/settings.json";
import enTask from "./locales/en/task.json";
import jaBoard from "./locales/ja/board.json";
import jaCommon from "./locales/ja/common.json";
import jaDetail from "./locales/ja/detail.json";
import jaErrors from "./locales/ja/errors.json";
import jaSettings from "./locales/ja/settings.json";
import jaTask from "./locales/ja/task.json";
import koBoard from "./locales/ko/board.json";
import koCommon from "./locales/ko/common.json";
import koDetail from "./locales/ko/detail.json";
import koErrors from "./locales/ko/errors.json";
import koSettings from "./locales/ko/settings.json";
import koTask from "./locales/ko/task.json";
import zhBoard from "./locales/zh/board.json";
import zhCommon from "./locales/zh/common.json";
import zhDetail from "./locales/zh/detail.json";
import zhErrors from "./locales/zh/errors.json";
import zhSettings from "./locales/zh/settings.json";
import zhTask from "./locales/zh/task.json";

export const SUPPORTED_LANGUAGES = ["en", "zh", "ja", "ko"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
	en: "English",
	zh: "中文",
	ja: "日本語",
	ko: "한국어",
};

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			en: {
				board: enBoard,
				common: enCommon,
				detail: enDetail,
				errors: enErrors,
				settings: enSettings,
				task: enTask,
			},
			zh: {
				board: zhBoard,
				common: zhCommon,
				detail: zhDetail,
				errors: zhErrors,
				settings: zhSettings,
				task: zhTask,
			},
			ja: {
				board: jaBoard,
				common: jaCommon,
				detail: jaDetail,
				errors: jaErrors,
				settings: jaSettings,
				task: jaTask,
			},
			ko: {
				board: koBoard,
				common: koCommon,
				detail: koDetail,
				errors: koErrors,
				settings: koSettings,
				task: koTask,
			},
		},
		fallbackLng: "en",
		supportedLngs: SUPPORTED_LANGUAGES,
		defaultNS: "common",
		detection: {
			order: ["localStorage", "navigator"],
			caches: ["localStorage"],
			lookupLocalStorage: "kanban-lang",
		},
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
