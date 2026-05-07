import { AppShell } from "@/components/app-shell";
import { loadAllKeywords } from "@/lib/data-loader";

export default async function Home() {
  const keywordsMap = await loadAllKeywords();

  return <AppShell keywordsMap={keywordsMap} />;
}
