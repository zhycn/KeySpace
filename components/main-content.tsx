"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/app-provider";
import { FavoritesView } from "@/components/favorites-view";
import { HomeView } from "@/components/home-view";
import { KeywordGrid } from "@/components/keyword-grid";
import { SearchEngineSelector } from "@/components/search-engine-selector";
import { SearchInput } from "@/components/search-input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { KeywordsFile } from "@/lib/types";

export function MainContent() {
  const { viewMode, currentCategoryId, categories } = useApp();
  const [keywordsData, setKeywordsData] = useState<Record<string, string[]>>(
    {},
  );

  useEffect(() => {
    async function loadKeywords() {
      const data: Record<string, string[]> = {};
      for (const cat of categories) {
        try {
          const mod = await import(`@/data/keywords/${cat.id}.json`);
          data[cat.id] = (mod.default as KeywordsFile).keywords;
        } catch {
          data[cat.id] = [];
        }
      }
      setKeywordsData(data);
    }
    loadKeywords();
  }, [categories]);

  const currentCategory = categories.find((c) => c.id === currentCategoryId);
  const currentKeywords = currentCategoryId
    ? (keywordsData[currentCategoryId] ?? [])
    : [];

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-14 items-center gap-4 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div className="flex-1 max-w-md">
          <SearchInput />
        </div>
        <SearchEngineSelector />
      </header>
      <main className="flex-1 overflow-auto p-6">
        {viewMode === "home" && <HomeView />}
        {viewMode === "favorites" && <FavoritesView />}
        {viewMode === "category" && currentCategory && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{currentCategory.name}</h2>
            <KeywordGrid
              keywords={currentKeywords}
              categoryId={currentCategory.id}
            />
          </div>
        )}
      </main>
    </div>
  );
}
