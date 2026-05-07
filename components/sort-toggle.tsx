"use client";

import { useTranslations } from "next-intl";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { SortMode } from "@/lib/click-utils";

interface SortToggleProps {
  value: SortMode;
  onChange: (value: SortMode) => void;
  namespace: "home" | "history";
}

export function SortToggle({ value, onChange, namespace }: SortToggleProps) {
  const t = useTranslations(namespace);

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v as SortMode);
      }}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="count">{t("sortByCount")}</ToggleGroupItem>
      <ToggleGroupItem value="recent">{t("sortByRecent")}</ToggleGroupItem>
    </ToggleGroup>
  );
}
