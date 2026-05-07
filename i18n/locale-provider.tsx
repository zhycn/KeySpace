"use client";

import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { type Locale, SUPPORTED_LOCALES } from "@/lib/constants";

export { SUPPORTED_LOCALES, type Locale };

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function useLocaleSwitch() {
  const ctx = useContext(LocaleContext);
  if (!ctx)
    throw new Error("useLocaleSwitch must be used within LocaleSwitchProvider");
  return ctx;
}

const messageCache = new Map<string, AbstractIntlMessages>();

async function loadMessages(locale: string): Promise<AbstractIntlMessages> {
  const cached = messageCache.get(locale);
  if (cached) return cached;
  const mod = await import(`../messages/${locale}.json`);
  messageCache.set(locale, mod.default);
  return mod.default;
}

export function LocaleSwitchProvider({
  initialLocale,
  initialMessages,
  children,
}: {
  initialLocale: string;
  initialMessages: AbstractIntlMessages;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(
    SUPPORTED_LOCALES.includes(initialLocale as Locale)
      ? (initialLocale as Locale)
      : "zh",
  );
  const [messages, setMessages] = useState(initialMessages);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("keyspace-locale");
    if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
      setLocaleState(stored as Locale);
      loadMessages(stored).then(setMessages);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    const newMessages = await loadMessages(newLocale);
    setMessages(newMessages);
    localStorage.setItem("keyspace-locale", newLocale);
    // biome-ignore lint/suspicious/noDocumentCookie: cookie needed for server-side locale resolution
    document.cookie = `keyspace-locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
