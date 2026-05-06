"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeywordTag } from "@/components/keyword-tag";
import { useApp } from "@/components/app-provider";

export function HomeView() {
  const { clickHistory, handleRemoveClickRecord } = useApp();
  const [sortMode, setSortMode] = useState<"count" | "recent">("count");

  const topKeywords = useMemo(() => {
    const sorted = [...clickHistory].sort((a, b) =>
      sortMode === "count" ? b.clickCount - a.clickCount : b.clickedAt - a.clickedAt,
    );
    return sorted.slice(0, 30);
  }, [clickHistory, sortMode]);

  return (
    <div className="space-y-8">
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
            >
              按点击数
            </Button>
            <Button
              variant={sortMode === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortMode("recent")}
            >
              按最新
            </Button>
          </div>
        </div>
        {topKeywords.length === 0 ? (
          <p className="text-muted-foreground">暂无点击记录，点击关键词开始使用</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topKeywords.map((r) => (
              <div key={`${r.keyword}-${r.categoryId}`} className="group relative inline-flex items-center gap-1">
                <KeywordTag keyword={r.keyword} categoryId={r.categoryId} />
                <span className="text-xs text-muted-foreground">{r.clickCount}次</span>
                <button
                  className="hidden group-hover:flex items-center justify-center rounded-full bg-destructive text-destructive-foreground p-0.5"
                  onClick={() => handleRemoveClickRecord(r.keyword, r.categoryId)}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
