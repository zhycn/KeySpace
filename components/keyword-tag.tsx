"use client";

import { useApp } from "@/components/app-provider";
import { Button } from "@/components/ui/button";

interface KeywordTagProps {
  keyword: string;
  categoryId: string;
}

export function KeywordTag({ keyword, categoryId }: KeywordTagProps) {
  const { handleKeywordClick } = useApp();

  return (
    <Button
      variant="outline"
      className="h-8 active:scale-95 transition-transform"
      onClick={() => handleKeywordClick(keyword, categoryId)}
    >
      {keyword}
    </Button>
  );
}
