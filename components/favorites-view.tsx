"use client";

import Fuse from "fuse.js";
import { useMemo } from "react";
import { useApp } from "@/components/app-provider";
import { KeywordTag } from "@/components/keyword-tag";

export function FavoritesView() {
  const { favorites, searchQuery, categories } = useApp();

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    const fuse = new Fuse(favorites, { threshold: 0.3, keys: ["keyword"] });
    return fuse.search(searchQuery).map((r) => r.item);
  }, [favorites, searchQuery]);

  const grouped = useMemo(() => {
    const map: Record<string, { categoryName: string; items: typeof filtered }> = {};
    for (const fav of filtered) {
      const cat = categories.find((c) => c.id === fav.categoryId);
      if (!map[fav.categoryId]) {
        map[fav.categoryId] = { categoryName: cat?.name ?? fav.categoryId, items: [] };
      }
      map[fav.categoryId].items.push(fav);
    }
    return map;
  }, [filtered, categories]);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">收藏关键词</h2>
        <div className="flex flex-col items-center gap-2 py-12">
          <p className="text-muted-foreground">
            {favorites.length === 0 ? "暂无收藏" : "没有匹配的收藏"}
          </p>
          {favorites.length === 0 && (
            <p className="text-sm text-muted-foreground">点击关键词旁的星标添加</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">收藏关键词</h2>
      {Object.entries(grouped).map(([catId, group]) => (
        <div key={catId} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">{group.categoryName}</h3>
          <div className="flex flex-wrap gap-3">
            {group.items.map((fav) => (
              <KeywordTag
                key={`${fav.keyword}-${fav.categoryId}`}
                keyword={fav.keyword}
                categoryId={fav.categoryId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
