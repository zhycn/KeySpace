import { AppSidebar } from "@/components/app-sidebar";
import { KeywordsProvider } from "@/components/keywords-provider";
import { MainContent } from "@/components/main-content";
import { NavigationProvider } from "@/components/navigation-provider";
import { SearchProvider } from "@/components/search-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { categories, defaultEngineId, engines } from "@/lib/data-loader";
import type { ViewMode } from "@/lib/types";

interface AppShellProps {
  keywordsMap: Record<string, string[]>;
  initialViewMode?: ViewMode;
  initialCategoryId?: string;
}

export function AppShell({
  keywordsMap,
  initialViewMode,
  initialCategoryId,
}: AppShellProps) {
  return (
    <KeywordsProvider keywordsMap={keywordsMap}>
      <SearchProvider
        categories={categories}
        engines={engines}
        defaultEngineId={defaultEngineId}
      >
        <NavigationProvider
          initialViewMode={initialViewMode}
          initialCategoryId={initialCategoryId}
        >
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
