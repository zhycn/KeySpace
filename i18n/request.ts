import { getRequestConfig } from "next-intl/server";
import { SUPPORTED_LOCALES } from "@/lib/constants";

const DEFAULT_LOCALE = "zh";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
    locale = DEFAULT_LOCALE;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
