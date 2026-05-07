"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <AlertCircle className="size-12 text-destructive" />
      <h2 className="text-lg font-semibold">{t("loadFailed")}</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || t("unknownError")}
      </p>
      <Button onClick={reset} variant="outline">
        {t("retry")}
      </Button>
    </div>
  );
}
