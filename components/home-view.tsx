"use client";

import Fuse from "fuse.js";
import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { KeywordTag } from "@/components/keyword-tag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {sortMode === "count" ? "热门关键词" : "最近点击"}
          </h2>
          <ToggleGroup
            type="single"
            value={sortMode}
            onValueChange={(v) => {
              if (v) setSortMode(v as "count" | "recent");
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="count">按点击数</ToggleGroupItem>
            <ToggleGroupItem value="recent">按最新</ToggleGroupItem>
          </ToggleGroup>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <p className="text-muted-foreground">
              {clickHistory.length === 0 ? "暂无点击记录" : "没有匹配的关键词"}
            </p>
            {clickHistory.length === 0 && (
              <p className="text-sm text-muted-foreground">
                点击关键词开始使用
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filtered.map((r) => (
              <div
                key={`${r.keyword}-${r.categoryId}`}
                className="group inline-flex items-center gap-1.5"
              >
                <KeywordTag keyword={r.keyword} categoryId={r.categoryId} />
                <Badge variant="secondary">{r.clickCount}次</Badge>
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
