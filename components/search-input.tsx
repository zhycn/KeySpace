"use client";

import { Search, X } from "lucide-react";
import { useApp } from "@/components/app-provider";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export function SearchInput() {
  const { searchQuery, setSearchQuery } = useApp();
  const hasQuery = searchQuery.length > 0;

  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        aria-label="搜索关键词"
        placeholder="搜索关键词..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {hasQuery && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label="清除搜索"
            onClick={() => setSearchQuery("")}
          >
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
