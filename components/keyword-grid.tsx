"use client";

import { useTranslations } from "next-intl";
import { KeywordTag } from "@/components/keyword-tag";

interface KeywordGridProps {
  keywords: string[];
  categoryId: string;
}

export function KeywordGrid({ keywords, categoryId }: KeywordGridProps) {
  const t = useTranslations("keyword");

  if (keywords.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <p className="text-muted-foreground">{t("none")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {keywords.map((kw) => (
        <KeywordTag key={kw} keyword={kw} categoryId={categoryId} />
      ))}
    </div>
  );
}
