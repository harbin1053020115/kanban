import * as RadixDropdown from "@radix-ui/react-dropdown-menu";
import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import type { SupportedLanguage } from "@/i18n";
import { changeLanguage, LANGUAGE_NAMES, SUPPORTED_LANGUAGES, useTranslation } from "@/i18n";

export function LanguageSelector(): React.ReactElement {
	const { t, i18n } = useTranslation();
	const currentLang = i18n.language as SupportedLanguage;

	return (
		<RadixDropdown.Root>
			<RadixDropdown.Trigger asChild>
				<Button
					variant="ghost"
					size="sm"
					icon={<Globe size={16} />}
					aria-label={t("common:tooltips.selectLanguage")}
				/>
			</RadixDropdown.Trigger>
			<RadixDropdown.Portal>
				<RadixDropdown.Content
					className="z-50 rounded-lg border border-border bg-surface-2 p-1 shadow-xl"
					style={{ animation: "kb-tooltip-show 100ms ease" }}
					align="end"
					sideOffset={5}
				>
					{SUPPORTED_LANGUAGES.map((lang) => (
						<RadixDropdown.Item
							key={lang}
							className={cn(
								"flex w-full items-center gap-2 px-2.5 py-1.5 text-[13px] text-text-primary rounded-md hover:bg-surface-3 cursor-pointer",
								currentLang === lang && "bg-surface-3",
							)}
							onSelect={() => changeLanguage(lang)}
						>
							<span className="flex-1">{LANGUAGE_NAMES[lang]}</span>
							{currentLang === lang ? <Check size={14} className="text-text-secondary" /> : null}
						</RadixDropdown.Item>
					))}
				</RadixDropdown.Content>
			</RadixDropdown.Portal>
		</RadixDropdown.Root>
	);
}
