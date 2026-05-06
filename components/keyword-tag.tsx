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
      className="cursor-pointer gap-1.5 px-4 py-2 text-base rounded-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all select-none"
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
        className="bg-transparent p-0 border-0 cursor-pointer ml-1"
        aria-label={fav ? "取消收藏" : "添加收藏"}
        onClick={(e) => {
          e.stopPropagation();
          handleToggleFavorite(keyword, categoryId);
        }}
      >
        <Star
          className={`h-4 w-4 shrink-0 transition-colors ${fav ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-400"}`}
        />
      </button>
    </Badge>
  );
}
