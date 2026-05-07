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
import type { Category, KeywordsFile, SearchEngine } from "@/lib/types";

const categories = categoriesData as Category[];
const engines = enginesData as SearchEngine[];

async function loadKeywords(
  categoryId: string,
): Promise<Record<string, string[]>> {
  try {
    const mod = await import(`@/data/keywords/${categoryId}.json`);
    return { [categoryId]: (mod.default as KeywordsFile).keywords };
  } catch {
    return { [categoryId]: [] };
  }
}

export async function generateStaticParams() {
  return categories.map((cat) => ({ categoryId: cat.id }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string; locale: string }>;
}) {
  const { categoryId } = await params;
  const keywordsMap = await loadKeywords(categoryId);

  return (
    <KeywordsProvider keywordsMap={keywordsMap}>
      <SearchProvider
        categories={categories}
        engines={engines}
        defaultEngineId={configData.defaultEngineId}
      >
        <NavigationProvider
          initialViewMode="category"
          initialCategoryId={categoryId}
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
