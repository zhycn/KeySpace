"use client";

import Fuse from "fuse.js";
import { useMemo } from "react";
import { useApp } from "@/components/app-provider";
import { KeywordTag } from "@/components/keyword-tag";

export function GlobalSearchResults() {
  const { searchQuery, keywordsMap, categories } = useApp();

  const results = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const allItems: { keyword: string; categoryId: string; categoryName: string }[] = [];
    for (const [catId, kws] of Object.entries(keywordsMap)) {
      const cat = categories.find((c) => c.id === catId);
      for (const kw of kws) {
        allItems.push({ keyword: kw, categoryId: catId, categoryName: cat?.name ?? catId });
      }
    }

    const fuse = new Fuse(allItems, { threshold: 0.3, keys: ["keyword"] });
    const matched = fuse.search(searchQuery).map((r) => r.item);

    const grouped: Record<string, { categoryName: string; items: { keyword: string; categoryId: string }[] }> = {};
    for (const item of matched) {
      if (!grouped[item.categoryId]) {
        grouped[item.categoryId] = { categoryName: item.categoryName, items: [] };
      }
      grouped[item.categoryId].items.push({ keyword: item.keyword, categoryId: item.categoryId });
    }

    return grouped;
  }, [searchQuery, keywordsMap, categories]);

  if (!results || Object.keys(results).length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <p className="text-muted-foreground">没有匹配的关键词</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(results).map(([catId, group]) => (
        <div key={catId} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">{group.categoryName}</h3>
          <div className="flex flex-wrap gap-3">
            {group.items.map((item) => (
              <KeywordTag key={item.keyword} keyword={item.keyword} categoryId={item.categoryId} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
