import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/app-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import categoriesData from "@/data/categories.json";
import configData from "@/data/config.json";
import enginesData from "@/data/engines.json";
import type { Category, SearchEngine } from "@/lib/types";

export const metadata: Metadata = {
  title: configData.siteName,
  description: "关键词导航工具",
};

const categories = categoriesData as Category[];
const engines = enginesData as SearchEngine[];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col">
        <AppProvider
          categories={categories}
          engines={engines}
          defaultEngineId={configData.defaultEngineId}
        >
          <TooltipProvider>{children}</TooltipProvider>
        </AppProvider>
      </body>
    </html>
  );
}
