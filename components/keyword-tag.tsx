"use client";

import { useApp } from "@/components/app-provider";
import { Button } from "@/components/ui/button";

interface KeywordTagProps {
  keyword: string;
  categoryId: string;
  clickCount?: number;
}

export function KeywordTag({ keyword, categoryId, clickCount }: KeywordTagProps) {
  const { handleKeywordClick } = useApp();

  return (
    <Button
      variant="outline"
      className="h-8 gap-2 active:scale-95 transition-transform"
      onClick={() => handleKeywordClick(keyword, categoryId)}
    >
      <span>{keyword}</span>
      {clickCount != null && (
        <span className="text-xs text-muted-foreground">{clickCount}次</span>
      )}
    </Button>
  );
}
