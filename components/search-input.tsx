"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useApp } from "@/components/app-provider";

export function SearchInput() {
  const { searchQuery, setSearchQuery } = useApp();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="搜索关键词..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
