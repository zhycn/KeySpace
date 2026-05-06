"use client";

import Fuse from "fuse.js";
import { useMemo } from "react";
import { useApp } from "@/components/app-provider";
import { KeywordTag } from "@/components/keyword-tag";

interface KeywordGridProps {
  keywords: string[];
  categoryId: string;
}

export function KeywordGrid({ keywords, categoryId }: KeywordGridProps) {
  const { searchQuery } = useApp();

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return keywords;
    const fuse = new Fuse(keywords, { threshold: 0.3 });
    return fuse.search(searchQuery).map((r) => r.item);
  }, [keywords, searchQuery]);

  if (filtered.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center">没有匹配的关键词</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {filtered.map((kw) => (
        <KeywordTag key={kw} keyword={kw} categoryId={categoryId} />
      ))}
    </div>
  );
}
