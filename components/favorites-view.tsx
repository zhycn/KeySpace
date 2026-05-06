"use client";

import Fuse from "fuse.js";
import { useMemo } from "react";
import { useApp } from "@/components/app-provider";
import { KeywordTag } from "@/components/keyword-tag";

export function FavoritesView() {
  const { favorites, searchQuery } = useApp();

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    const fuse = new Fuse(favorites, {
      threshold: 0.3,
      keys: ["keyword"],
    });
    return fuse.search(searchQuery).map((r) => r.item);
  }, [favorites, searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">收藏关键词</h2>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12">
          <p className="text-muted-foreground">
            {favorites.length === 0 ? "暂无收藏" : "没有匹配的收藏"}
          </p>
          {favorites.length === 0 && (
            <p className="text-sm text-muted-foreground">
              点击关键词旁的星标添加
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {filtered.map((fav) => (
            <KeywordTag
              key={`${fav.keyword}-${fav.categoryId}`}
              keyword={fav.keyword}
              categoryId={fav.categoryId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
