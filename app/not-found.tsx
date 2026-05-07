import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <FileQuestion className="size-12 text-muted-foreground" />
      <h2 className="text-lg font-semibold">页面未找到</h2>
      <p className="text-sm text-muted-foreground">
        你访问的页面不存在或已被移除
      </p>
      <Button asChild variant="outline">
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
