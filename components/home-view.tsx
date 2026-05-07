"use client";

import {
  Award,
  BarChart3,
  FileText,
  FolderOpen,
  MousePointerClick,
  Search,
  Share2,
  ShoppingCart,
  X,
  Video,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { KeywordTag } from "@/components/keyword-tag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  MousePointerClick,
  FileText,
  Share2,
  ShoppingCart,
  BarChart3,
  Award,
  Video,
};

const MAX_CATEGORIES = 8;
const MAX_KEYWORDS = 36;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface RecommendedKeyword {
  keyword: string;
  categoryId: string;
  clickCount?: number;
  isRecommended: boolean;
}

export function HomeView() {
  const {
    clickHistory,
    handleRemoveClickRecord,
    categories,
    keywordsMap,
    setViewMode,
    setCurrentCategoryId,
  } = useApp();
  const [sortMode, setSortMode] = useState<"count" | "recent">("count");

  const recommendedCategories = useMemo(() => {
    const clicksByCategory: Record<string, number> = {};
    for (const r of clickHistory) {
      clicksByCategory[r.categoryId] =
        (clicksByCategory[r.categoryId] ?? 0) + r.clickCount;
    }

    const sorted = [...categories].sort((a, b) => {
      const diff = (clicksByCategory[b.id] ?? 0) - (clicksByCategory[a.id] ?? 0);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name, "zh-CN");
    });

    if (sorted.length <= MAX_CATEGORIES) return sorted;

    const preferred = sorted.filter((c) => (clicksByCategory[c.id] ?? 0) > 0);
    const remaining = sorted.filter((c) => !(clicksByCategory[c.id] > 0));

    const result = preferred.slice(0, MAX_CATEGORIES);
    const need = MAX_CATEGORIES - result.length;
    if (need > 0) {
      result.push(...shuffle(remaining).slice(0, need));
    }

    return result;
  }, [categories, clickHistory]);

  const recommendedKeywords = useMemo(() => {
    const clicksByCategory: Record<string, number> = {};
    const clickedSet = new Set(
      clickHistory.map((r) => `${r.categoryId}::${r.keyword}`),
    );

    for (const r of clickHistory) {
      clicksByCategory[r.categoryId] =
        (clicksByCategory[r.categoryId] ?? 0) + r.clickCount;
    }

    const preferredCategoryIds = Object.entries(clicksByCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => id);

    const hotKeywords: RecommendedKeyword[] = [...clickHistory]
      .sort((a, b) =>
        sortMode === "count"
          ? b.clickCount - a.clickCount
          : b.clickedAt - a.clickedAt,
      )
      .slice(0, 15)
      .map((r) => ({
        keyword: r.keyword,
        categoryId: r.categoryId,
        clickCount: r.clickCount,
        isRecommended: false,
      }));

    const discoveryKeywords: RecommendedKeyword[] = [];
    const categoryOrder = preferredCategoryIds.length > 0
      ? preferredCategoryIds
      : categories.map((c) => c.id);

    for (const catId of categoryOrder) {
      const kws = keywordsMap[catId] ?? [];
      const unclicked = kws.filter(
        (kw) => !clickedSet.has(`${catId}::${kw}`),
      );
      discoveryKeywords.push(
        ...shuffle(unclicked)
          .slice(0, 5)
          .map((kw) => ({
            keyword: kw,
            categoryId: catId,
            isRecommended: true,
          })),
      );
    }

    if (discoveryKeywords.length < 10) {
      const otherIds = categories
        .map((c) => c.id)
        .filter((id) => !categoryOrder.includes(id));
      for (const catId of otherIds) {
        const kws = keywordsMap[catId] ?? [];
        const unclicked = kws.filter(
          (kw) => !clickedSet.has(`${catId}::${kw}`),
        );
        discoveryKeywords.push(
          ...shuffle(unclicked)
            .slice(0, 3)
            .map((kw) => ({
              keyword: kw,
              categoryId: catId,
              isRecommended: true,
            })),
        );
      }
    }

    const merged = [
      ...hotKeywords,
      ...shuffle(discoveryKeywords).slice(
        0,
        MAX_KEYWORDS - hotKeywords.length,
      ),
    ];

    return merged.slice(0, MAX_KEYWORDS);
  }, [clickHistory, sortMode, categories, keywordsMap]);

  const hasContent =
    recommendedCategories.length > 0 || recommendedKeywords.length > 0;

  if (!hasContent) return null;

  return (
    <div className="flex flex-col gap-8">
      {recommendedCategories.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">推荐分类</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recommendedCategories.map((cat) => {
              const count = keywordsMap[cat.id]?.length ?? 0;
              const Icon =
                cat.icon && iconMap[cat.icon] ? iconMap[cat.icon] : FolderOpen;
              return (
                <Button
                  key={cat.id}
                  variant="outline"
                  className="h-auto flex flex-col items-center gap-2 py-4"
                  onClick={() => {
                    setCurrentCategoryId(cat.id);
                    setViewMode("category");
                  }}
                >
                  <Icon className="size-6 text-muted-foreground" />
                  <span className="font-medium">{cat.name}</span>
                  <Badge variant="secondary">{count}个关键词</Badge>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {recommendedKeywords.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">推荐关键词</h2>
            {clickHistory.length > 0 && (
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
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedKeywords.map((item) => (
              <div
                key={`${item.keyword}-${item.categoryId}`}
                className="group relative inline-flex items-center gap-1.5"
              >
                <KeywordTag
                  keyword={item.keyword}
                  categoryId={item.categoryId}
                />
                {item.isRecommended ? (
                  <Badge variant="outline">推荐</Badge>
                ) : (
                  <Badge variant="secondary">{item.clickCount}次</Badge>
                )}
                {!item.isRecommended && (
                  <Button
                    variant="destructive"
                    size="icon"
                    aria-label="删除记录"
                    className="absolute -top-1.5 -right-1.5 hidden group-hover:flex group-focus-within:flex size-4 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveClickRecord(item.keyword, item.categoryId);
                    }}
                  >
                    <X />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
