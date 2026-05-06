"use client";

import Fuse from "fuse.js";
import { useMemo } from "react";
import { useApp } from "@/components/app-provider";
import { KeywordTag } from "@/components/keyword-tag";

export function FavoritesView() {
  const { favorites, categories, searchQuery } = useApp();

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    const fuse = new Fuse(favorites, { threshold: 0.3 });
    return fuse.search(searchQuery).map((r) => r.item);
  }, [favorites, searchQuery]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">收藏关键词</h2>
      {filtered.length === 0 ? (
        <p className="text-muted-foreground">
          {favorites.length === 0
            ? "暂无收藏，点击关键词旁的星标添加"
            : "没有匹配的收藏"}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filtered.map((kw) => (
            <KeywordTag
              key={kw}
              keyword={kw}
              categoryId={categories[0]?.id ?? ""}
            />
          ))}
        </div>
      )}
    </div>
  );
}
