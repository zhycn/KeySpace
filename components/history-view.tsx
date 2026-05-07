"use client";

import { useMemo, useState } from "react";
import { KeywordTag } from "@/components/keyword-tag";
import { useSearch } from "@/components/search-provider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function HistoryView() {
  const { clickHistory, categories } = useSearch();
  const [sortMode, setSortMode] = useState<"count" | "recent">("count");

  const sorted = useMemo(() => {
    return [...clickHistory].sort((a, b) =>
      sortMode === "count"
        ? b.clickCount - a.clickCount
        : b.clickedAt - a.clickedAt,
    );
  }, [clickHistory, sortMode]);

  const grouped = useMemo(() => {
    const map: Record<string, { categoryName: string; items: typeof sorted }> =
      {};
    for (const record of sorted) {
      const cat = categories.find((c) => c.id === record.categoryId);
      const group = map[record.categoryId];
      if (!group) {
        map[record.categoryId] = {
          categoryName: cat?.name ?? record.categoryId,
          items: [record],
        };
      } else {
        group.items.push(record);
      }
    }
    return map;
  }, [sorted, categories]);

  if (clickHistory.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <p className="text-muted-foreground">暂无点击记录</p>
        <p className="text-sm text-muted-foreground">
          点击关键词后会自动记录在这里
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">历史记录</h2>
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
          <ToggleGroupItem value="recent">按最近</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {Object.entries(grouped).map(([catId, group]) => (
        <div key={catId} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {group.categoryName}
          </h3>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <KeywordTag
                key={`${item.keyword}-${item.categoryId}`}
                keyword={item.keyword}
                categoryId={item.categoryId}
                clickCount={item.clickCount}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
