"use client";

import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/components/app-provider";

interface KeywordTagProps {
  keyword: string;
  categoryId: string;
}

export function KeywordTag({ keyword, categoryId }: KeywordTagProps) {
  const { favorites, handleToggleFavorite, handleKeywordClick } = useApp();
  const isFav = favorites.includes(keyword);

  return (
    <Badge
      variant="outline"
      className="cursor-pointer gap-1 px-3 py-1.5 text-sm hover:bg-accent transition-colors select-none"
    >
      <span onClick={() => handleKeywordClick(keyword, categoryId)}>{keyword}</span>
      <Star
        className={`h-3 w-3 shrink-0 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
        onClick={(e) => {
          e.stopPropagation();
          handleToggleFavorite(keyword);
        }}
      />
    </Badge>
  );
}
