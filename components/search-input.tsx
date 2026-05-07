"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { SearchEngineSelector } from "@/components/search-engine-selector";
import { useSearch } from "@/components/search-provider";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";

export function SearchInput() {
  const { searchQuery, setSearchQuery } = useSearch();
  const hasQuery = searchQuery.length > 0;
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("search");

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
      <InputGroupAddon align="inline-start">
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        ref={inputRef}
        aria-label={t("label")}
        placeholder={t("placeholder")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <InputGroupAddon align="inline-end">
        {hasQuery ? (
          <InputGroupButton
            size="icon-xs"
            aria-label={t("clear")}
            onClick={() => setSearchQuery("")}
          >
            <X />
          </InputGroupButton>
        ) : (
          <Kbd>⌘K</Kbd>
        )}
        <SearchEngineSelector />
      </InputGroupAddon>
    </InputGroup>
  );
}
