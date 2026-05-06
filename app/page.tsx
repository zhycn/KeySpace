import { AppSidebar } from "@/components/app-sidebar";
import { MainContent } from "@/components/main-content";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import categoriesData from "@/data/categories.json";
import type { Category, KeywordsFile } from "@/lib/types";

const categories = categoriesData as Category[];

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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <MainContent keywordsMap={keywordsMap} />
      </SidebarInset>
    </SidebarProvider>
  );
}
