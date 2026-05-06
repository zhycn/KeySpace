"use client";

import { Star } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
        data-icon="inline-end"
        className="bg-transparent p-0 border-0 cursor-pointer"
        aria-label={fav ? "取消收藏" : "添加收藏"}
        onClick={(e) => {
          e.stopPropagation();
          handleToggleFavorite(keyword, categoryId);
        }}
      >
        <Star
          className={cn(
            "shrink-0 transition-colors",
            fav
              ? "fill-primary text-primary"
              : "text-muted-foreground hover:text-primary",
          )}
        />
      </button>
    </Badge>
  );
}
