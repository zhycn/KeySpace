"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <AlertCircle className="size-12 text-destructive" />
      <h2 className="text-lg font-semibold">页面加载失败</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "发生了未知错误"}
      </p>
      <Button onClick={reset} variant="outline">
        重试
      </Button>
    </div>
  );
}
