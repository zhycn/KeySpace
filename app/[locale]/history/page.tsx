import { AppSidebar } from "@/components/app-sidebar";
import { KeywordsProvider } from "@/components/keywords-provider";
import { MainContent } from "@/components/main-content";
import { NavigationProvider } from "@/components/navigation-provider";
import { SearchProvider } from "@/components/search-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import categoriesData from "@/data/categories.json";
import configData from "@/data/config.json";
import enginesData from "@/data/engines.json";
import type { Category, SearchEngine } from "@/lib/types";

const categories = categoriesData as Category[];
const engines = enginesData as SearchEngine[];

export default function HistoryPage() {
  return (
    <KeywordsProvider keywordsMap={{}}>
      <SearchProvider
        categories={categories}
        engines={engines}
        defaultEngineId={configData.defaultEngineId}
      >
        <NavigationProvider initialViewMode="history">
          <TooltipProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <MainContent />
              </SidebarInset>
            </SidebarProvider>
            <Toaster />
          </TooltipProvider>
        </NavigationProvider>
      </SearchProvider>
    </KeywordsProvider>
  );
}
