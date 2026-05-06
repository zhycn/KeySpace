"use client";

import Fuse from "fuse.js";
import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { KeywordTag } from "@/components/keyword-tag";
import { Button } from "@/components/ui/button";

export function HomeView() {
  const { clickHistory, handleRemoveClickRecord, searchQuery } = useApp();
  const [sortMode, setSortMode] = useState<"count" | "recent">("count");

  const topKeywords = useMemo(() => {
    const sorted = [...clickHistory].sort((a, b) =>
      sortMode === "count"
        ? b.clickCount - a.clickCount
        : b.clickedAt - a.clickedAt,
    );
    return sorted.slice(0, 30);
  }, [clickHistory, sortMode]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return topKeywords;
    const fuse = new Fuse(topKeywords, {
      threshold: 0.3,
      keys: ["keyword"],
    });
    return fuse.search(searchQuery).map((r) => r.item);
  }, [topKeywords, searchQuery]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {sortMode === "count" ? "热门关键词" : "最近点击"}
          </h2>
          <div className="flex gap-2">
            <Button
              variant={sortMode === "count" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortMode("count")}
              aria-pressed={sortMode === "count"}
            >
              按点击数
            </Button>
            <Button
              variant={sortMode === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortMode("recent")}
              aria-pressed={sortMode === "recent"}
            >
              按最新
            </Button>
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="text-muted-foreground">
            {clickHistory.length === 0
              ? "暂无点击记录，点击关键词开始使用"
              : "没有匹配的关键词"}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filtered.map((r) => (
              <div
                key={`${r.keyword}-${r.categoryId}`}
                className="group relative inline-flex items-center gap-1"
              >
                <KeywordTag keyword={r.keyword} categoryId={r.categoryId} />
                <span className="text-xs text-muted-foreground">
                  {r.clickCount}次
                </span>
                <Button
                  variant="destructive"
                  size="icon"
                  aria-label="删除记录"
                  className="hidden group-hover:flex group-focus-within:flex size-5 rounded-full"
                  onClick={() =>
                    handleRemoveClickRecord(r.keyword, r.categoryId)
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
