import { AppProvider } from "@/components/app-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { MainContent } from "@/components/main-content";
import { Toaster } from "@/components/ui/sonner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import categoriesData from "@/data/categories.json";
import configData from "@/data/config.json";
import enginesData from "@/data/engines.json";
import type { Category, KeywordsFile, SearchEngine } from "@/lib/types";

const categories = categoriesData as Category[];
const engines = enginesData as SearchEngine[];

async function loadAllKeywords(): Promise<Record<string, string[]>> {
  const entries = await Promise.all(
    categories.map(async (cat) => {
      try {
        const mod = await import(`@/data/keywords/${cat.id}.json`);
        return [cat.id, (mod.default as KeywordsFile).keywords] as const;
      } catch {
        return [cat.id, []] as const;
      }
    }),
  );
  return Object.fromEntries(entries);
}

export default async function Home() {
  const keywordsMap = await loadAllKeywords();

  return (
    <AppProvider
      categories={categories}
      engines={engines}
      defaultEngineId={configData.defaultEngineId}
      keywordsMap={keywordsMap}
    >
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <MainContent keywordsMap={keywordsMap} />
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </AppProvider>
  );
}
