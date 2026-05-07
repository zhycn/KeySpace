import type { Metadata } from "next";
import { headers } from "next/headers";
import { getMessages, getTranslations } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleSwitchProvider } from "@/i18n/locale-provider";
import { SUPPORTED_LOCALES } from "@/lib/constants";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: { default: t("title"), template: `%s | ${t("title")}` },
    description: t("description"),
    icons: { icon: "/favicon.ico" },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: "zh_CN",
    },
  };
}

function resolveLocale(cookieHeader: string | null): string {
  if (cookieHeader) {
    const match = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("keyspace-locale="))
      ?.split("=")[1];
    if (
      match &&
      SUPPORTED_LOCALES.includes(match as (typeof SUPPORTED_LOCALES)[number])
    ) {
      return match;
    }
  }
  return "zh";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const cookieHeader = (await headers()).get("cookie");
  const locale = resolveLocale(cookieHeader);

  return (
    <html
      lang={locale}
      className="h-full antialiased font-sans"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <LocaleSwitchProvider initialLocale={locale} initialMessages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </LocaleSwitchProvider>
      </body>
    </html>
  );
}
