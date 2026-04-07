import type { SupportedLanguage } from "./config";
import i18n from "./config";

export function changeLanguage(lang: SupportedLanguage) {
	i18n.changeLanguage(lang);
}
