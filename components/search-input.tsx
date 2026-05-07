"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useApp } from "@/components/app-provider";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";

export function SearchInput() {
  const { searchQuery, setSearchQuery } = useApp();
  const hasQuery = searchQuery.length > 0;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setSearchQuery("");
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setSearchQuery]);

  return (
    <InputGroup>
      <InputGroupInput
        ref={inputRef}
        aria-label="搜索关键词"
        placeholder="搜索关键词..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <InputGroupAddon align="inline-start">
        <Search />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        {hasQuery ? (
          <InputGroupButton
            size="icon-xs"
            aria-label="清除搜索"
            onClick={() => setSearchQuery("")}
          >
            <X />
          </InputGroupButton>
        ) : (
          <Kbd>⌘K</Kbd>
        )}
      </InputGroupAddon>
    </InputGroup>
  );
}
