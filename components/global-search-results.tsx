"use client";

import Fuse from "fuse.js";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { KeywordTag } from "@/components/keyword-tag";
import { useKeywordsMap } from "@/components/keywords-provider";
import { useSearch } from "@/components/search-provider";
import { groupByCategory } from "@/lib/click-utils";

interface SearchItem {
  keyword: string;
  categoryId: string;
  categoryName: string;
}

export function GlobalSearchResults() {
  const { searchQuery, categories } = useSearch();
  const keywordsMap = useKeywordsMap();
  const t = useTranslations("search");

  const fuseIndex = useMemo(() => {
    const allItems: SearchItem[] = [];
    for (const [catId, kws] of Object.entries(keywordsMap)) {
      const cat = categories.find((c) => c.id === catId);
      for (const kw of kws) {
        allItems.push({
          keyword: kw,
          categoryId: catId,
          categoryName: cat?.name ?? catId,
        });
      }
    }
    return new Fuse(allItems, { threshold: 0.3, keys: ["keyword"] });
  }, [keywordsMap, categories]);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const matched = fuseIndex.search(searchQuery).map((r) => r.item);
    return groupByCategory(matched, categories);
  }, [searchQuery, fuseIndex, categories]);

  if (!results || Object.keys(results).length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <p className="text-muted-foreground">{t("noMatch")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(results).map(([catId, group]) => (
        <div key={catId} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {group.categoryName}
          </h3>
          <div className="flex flex-wrap gap-3">
            {group.items.map((item) => (
              <KeywordTag
                key={item.keyword}
                keyword={item.keyword}
                categoryId={item.categoryId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
