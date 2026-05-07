export const SUPPORTED_LOCALES = ["zh", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
