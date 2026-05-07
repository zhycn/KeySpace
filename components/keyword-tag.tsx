"use client";

import { useTranslations } from "next-intl";
import { useSearch } from "@/components/search-provider";
import { Button } from "@/components/ui/button";

interface KeywordTagProps {
  keyword: string;
  categoryId: string;
  clickCount?: number;
}

export function KeywordTag({
  keyword,
  categoryId,
  clickCount,
}: KeywordTagProps) {
  const { handleKeywordClick } = useSearch();
  const t = useTranslations("keyword");

  return (
    <Button
      variant="outline"
      className="h-8 gap-2 active:scale-95 transition-transform"
      onClick={() => handleKeywordClick(keyword, categoryId)}
      aria-label={t("searchLabel", { keyword })}
    >
      <span>{keyword}</span>
      {clickCount != null && (
        <span className="text-xs text-muted-foreground">
          {t("clickTimes", { count: clickCount })}
        </span>
      )}
    </Button>
  );
}
