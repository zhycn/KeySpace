import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import configData from "@/data/config.json";

export const metadata: Metadata = {
  title: {
    default: configData.siteName,
    template: `%s | ${configData.siteName}`,
  },
  description: "关键词导航工具 — 快速搜索营销关键词，支持多搜索引擎切换",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: configData.siteName,
    description: "关键词导航工具 — 快速搜索营销关键词，支持多搜索引擎切换",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased font-sans"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
