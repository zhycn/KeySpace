"use client";

import { Star } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Badge } from "@/components/ui/badge";

interface KeywordTagProps {
  keyword: string;
  categoryId: string;
}

export function KeywordTag({ keyword, categoryId }: KeywordTagProps) {
  const { isFavorite, handleToggleFavorite, handleKeywordClick } = useApp();
  const fav = isFavorite(keyword, categoryId);

  return (
    <Badge
      variant="outline"
      className="cursor-pointer gap-1 px-3 py-1.5 text-sm hover:bg-accent transition-colors select-none"
    >
      <button
        type="button"
        className="bg-transparent p-0 border-0 text-inherit cursor-pointer"
        onClick={() => handleKeywordClick(keyword, categoryId)}
      >
        {keyword}
      </button>
      <button
        type="button"
        className="bg-transparent p-0 border-0 cursor-pointer"
        aria-label={fav ? "取消收藏" : "添加收藏"}
        onClick={(e) => {
          e.stopPropagation();
          handleToggleFavorite(keyword, categoryId);
        }}
      >
        <Star
          className={`h-3 w-3 shrink-0 ${fav ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
        />
      </button>
    </Badge>
  );
}
