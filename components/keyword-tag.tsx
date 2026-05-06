"use client";

import { Star } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KeywordTagProps {
  keyword: string;
  categoryId: string;
}

export function KeywordTag({ keyword, categoryId }: KeywordTagProps) {
  const { isFavorite, handleToggleFavorite, handleKeywordClick } = useApp();
  const fav = isFavorite(keyword, categoryId);

  return (
    <div className="inline-flex items-center -space-x-px">
      <Button
        variant="outline"
        className="h-8 rounded-r-none pr-2"
        onClick={() => handleKeywordClick(keyword, categoryId)}
      >
        {keyword}
      </Button>
      <Button
        variant="outline"
        className="h-8 w-8 rounded-l-none border-l-0"
        aria-label={fav ? "取消收藏" : "添加收藏"}
        onClick={() => handleToggleFavorite(keyword, categoryId)}
      >
        <Star
          className={cn(
            "transition-colors",
            fav
              ? "fill-primary text-primary"
              : "text-muted-foreground hover:text-primary",
          )}
        />
      </Button>
    </div>
  );
}
