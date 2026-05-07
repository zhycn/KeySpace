import { Skeleton } from "@/components/ui/skeleton";

const categorySkeletons = Array.from({ length: 6 }, (_, i) => `cat-${i}`);
const keywordSkeletons = Array.from({ length: 12 }, (_, i) => `kw-${i}`);

export default function Loading() {
  return (
    <div className="flex flex-col h-full">
      <header className="flex h-14 items-center gap-4 px-4">
        <Skeleton className="size-8" />
        <Skeleton className="h-9 flex-1 max-w-md" />
        <Skeleton className="h-9 w-[140px]" />
        <Skeleton className="size-9" />
      </header>
      <div className="h-px bg-border" />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-7 w-32" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categorySkeletons.map((key) => (
                <Skeleton key={key} className="h-28 w-full rounded-md" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-7 w-32" />
            <div className="flex flex-wrap gap-2">
              {keywordSkeletons.map((key) => (
                <Skeleton key={key} className="h-8 w-20 rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
