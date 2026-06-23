"use client";

import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "./I18nProvider";
import { GlobeIcon } from "./Icons";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useI18n();

  const target: "en" | "ms" = locale === "en" ? "ms" : "en";

  function switchLocale() {
    document.cookie = `locale=${target}; path=/; max-age=${60 * 60 * 24 * 365}`;
    const segments = pathname.split("/");
    if (segments[1] === locale) {
      segments[1] = target;
    } else {
      segments.splice(1, 0, target);
    }
    router.push(segments.join("/") || `/${target}`);
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="lang-pill"
      aria-label={`Switch language to ${target.toUpperCase()}`}
      title={`Switch language to ${target.toUpperCase()}`}
    >
      <GlobeIcon size={16} />
      <span className="uppercase">{target}</span>
    </button>
  );
}
