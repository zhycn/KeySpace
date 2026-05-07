import { AppShell } from "@/components/app-shell";
import { loadAllKeywords } from "@/lib/data-loader";

export default async function HistoryPage() {
  const keywordsMap = await loadAllKeywords();

  return <AppShell keywordsMap={keywordsMap} initialViewMode="history" />;
}
