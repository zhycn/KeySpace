"use client";

import { useApp } from "@/components/app-provider";
import { GlobalSearchResults } from "@/components/global-search-results";
import { HomeView } from "@/components/home-view";
import { KeywordGrid } from "@/components/keyword-grid";
import { SearchEngineSelector } from "@/components/search-engine-selector";
import { SearchInput } from "@/components/search-input";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface MainContentProps {
  keywordsMap: Record<string, string[]>;
}

export function MainContent({ keywordsMap }: MainContentProps) {
  const { viewMode, currentCategoryId, categories, searchQuery } = useApp();

  const currentCategory = categories.find((c) => c.id === currentCategoryId);
  const currentKeywords = currentCategoryId
    ? (keywordsMap[currentCategoryId] ?? [])
    : [];

  const showGlobalSearch = !!searchQuery.trim();

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-14 items-center gap-4 px-4">
        <SidebarTrigger />
        <div className="flex-1 max-w-md">
          <SearchInput />
        </div>
        <SearchEngineSelector />
        <ThemeToggle />
      </header>
      <Separator />
      <main className="flex-1 overflow-auto p-6">
        {showGlobalSearch ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">搜索结果</h2>
            <GlobalSearchResults />
          </div>
        ) : (
          <>
            {viewMode === "home" && <HomeView />}
            {viewMode === "category" && currentCategory && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">{currentCategory.name}</h2>
                <KeywordGrid
                  keywords={currentKeywords}
                  categoryId={currentCategory.id}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
