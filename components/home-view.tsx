"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { KeywordTag } from "@/components/keyword-tag";
import { useKeywordsMap } from "@/components/keywords-provider";
import { useNavigation } from "@/components/navigation-provider";
import { useSearch } from "@/components/search-provider";
import { SortToggle } from "@/components/sort-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getClicksByCategory, sortRecords } from "@/lib/click-utils";
import { getIcon } from "@/lib/icon-map";
import { seededShuffle } from "@/lib/seeded-shuffle";

const MAX_CATEGORIES = 8;
const MAX_KEYWORDS = 36;

interface RecommendedKeyword {
  keyword: string;
  categoryId: string;
  clickCount?: number;
  isRecommended: boolean;
}

export function HomeView() {
  const { clickHistory, categories } = useSearch();
  const { setViewMode, setCurrentCategoryId } = useNavigation();
  const keywordsMap = useKeywordsMap();
  const [sortMode, setSortMode] = useState<"count" | "recent">("count");
  const t = useTranslations("home");
  const tOnboarding = useTranslations("onboarding");

  const clicksByCategory = useMemo(
    () => getClicksByCategory(clickHistory),
    [clickHistory],
  );

  const recommendedCategories = useMemo(() => {
    const sorted = [...categories].sort((a, b) => {
      const diff =
        (clicksByCategory[b.id] ?? 0) - (clicksByCategory[a.id] ?? 0);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name, "zh-CN");
    });

    if (sorted.length <= MAX_CATEGORIES) return sorted;

    const preferred = sorted.filter((c) => (clicksByCategory[c.id] ?? 0) > 0);
    const remaining = sorted.filter((c) => (clicksByCategory[c.id] ?? 0) === 0);

    const result = preferred.slice(0, MAX_CATEGORIES);
    const need = MAX_CATEGORIES - result.length;
    if (need > 0) {
      result.push(...seededShuffle(remaining, 42).slice(0, need));
    }

    return result;
  }, [categories, clicksByCategory]);

  const recommendedKeywords = useMemo(() => {
    const clickedSet = new Set(
      clickHistory.map((r) => `${r.categoryId}::${r.keyword}`),
    );

    const preferredCategoryIds = Object.entries(clicksByCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => id);

    const hotKeywords: RecommendedKeyword[] = sortRecords(
      clickHistory,
      sortMode,
    )
      .slice(0, 15)
      .map((r) => ({
        keyword: r.keyword,
        categoryId: r.categoryId,
        clickCount: r.clickCount,
        isRecommended: false,
      }));

    const discoveryKeywords: RecommendedKeyword[] = [];
    const categoryOrder =
      preferredCategoryIds.length > 0
        ? preferredCategoryIds
        : categories.map((c) => c.id);

    for (const catId of categoryOrder) {
      const kws = keywordsMap[catId] ?? [];
      const unclicked = kws.filter((kw) => !clickedSet.has(`${catId}::${kw}`));
      discoveryKeywords.push(
        ...seededShuffle(unclicked, clickHistory.length + catId.length)
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
          ...seededShuffle(unclicked, clickHistory.length + catId.length * 2)
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
      ...seededShuffle(discoveryKeywords, 7).slice(
        0,
        MAX_KEYWORDS - hotKeywords.length,
      ),
    ];

    return merged.slice(0, MAX_KEYWORDS);
  }, [clickHistory, sortMode, categories, keywordsMap, clicksByCategory]);

  const hasContent =
    recommendedCategories.length > 0 || recommendedKeywords.length > 0;

  if (!hasContent) return null;

  return (
    <div className="flex flex-col gap-8">
      {clickHistory.length === 0 && (
        <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
          {tOnboarding("welcome")}
        </div>
      )}
      {recommendedCategories.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">
            {clickHistory.length === 0
              ? t("browseCategories")
              : t("recommendedCategories")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recommendedCategories.map((cat) => {
              const count = keywordsMap[cat.id]?.length ?? 0;
              const Icon = getIcon(cat.icon);
              return (
                <Button
                  key={cat.id}
                  variant="outline"
                  className="h-auto flex flex-col items-center gap-2 py-4"
                  onClick={() => {
                    setCurrentCategoryId(cat.id);
                    setViewMode("category");
                  }}
                  aria-label={t("browseCategory", { name: cat.name })}
                >
                  <Icon className="size-6 text-muted-foreground" />
                  <span className="font-medium">{cat.name}</span>
                  <Badge variant="secondary">
                    {t("keywordCount", { count })}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {recommendedKeywords.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {t("recommendedKeywords")}
            </h2>
            {clickHistory.length > 0 && (
              <SortToggle
                value={sortMode}
                onChange={setSortMode}
                namespace="home"
              />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedKeywords.map((item) => (
              <KeywordTag
                key={`${item.keyword}-${item.categoryId}`}
                keyword={item.keyword}
                categoryId={item.categoryId}
                clickCount={item.isRecommended ? undefined : item.clickCount}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
