import "server-only";

const dictionaries = {
  en: () => import("../dictionaries/en.json").then((module) => module.default),
  ms: () => import("../dictionaries/ms.json").then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const i18n = {
  locales: ["en", "ms"] as const,
  defaultLocale: "en" as const,
};

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;

export const getDictionary = async (locale: Locale) => dictionaries[locale]();

// Discriminated union describing one entry in itinerary.events.
export type ItineraryEvent =
  | { section: string }
  | { time: string; label: string }
  | { time: string; items: string[] };

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
