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
      <div className="flex flex-col items-center gap-2 py-12">
        <p className="text-muted-foreground">没有匹配的关键词</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {filtered.map((kw) => (
        <KeywordTag key={kw} keyword={kw} categoryId={categoryId} />
      ))}
    </div>
  );
}
