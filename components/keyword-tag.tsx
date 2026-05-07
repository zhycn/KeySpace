"use client";

import { EllipsisVertical, Trash2 } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KeywordTagProps {
  keyword: string;
  categoryId: string;
  clickCount?: number;
  onDelete?: () => void;
}

export function KeywordTag({ keyword, categoryId, clickCount, onDelete }: KeywordTagProps) {
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
      {onDelete && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span
              role="button"
              tabIndex={0}
              aria-label="更多操作"
              className="inline-flex items-center justify-center size-4 rounded-sm hover:bg-muted -mr-1"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <EllipsisVertical className="size-3" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onClick={onDelete}
            >
              <Trash2 />
              删除记录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Button>
  );
}
