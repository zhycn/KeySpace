"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { KeywordTag } from "@/components/keyword-tag";
import { useSearch } from "@/components/search-provider";
import { SortToggle } from "@/components/sort-toggle";
import { groupByCategory, type SortMode, sortRecords } from "@/lib/click-utils";

export function HistoryView() {
  const { clickHistory, categories } = useSearch();
  const [sortMode, setSortMode] = useState<SortMode>("count");
  const t = useTranslations("history");

  const grouped = useMemo(() => {
    const sorted = sortRecords(clickHistory, sortMode);
    return groupByCategory(sorted, categories);
  }, [clickHistory, sortMode, categories]);

  if (clickHistory.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <p className="text-muted-foreground">{t("empty")}</p>
        <p className="text-sm text-muted-foreground">{t("emptyDesc")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <SortToggle
          value={sortMode}
          onChange={setSortMode}
          namespace="history"
        />
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
