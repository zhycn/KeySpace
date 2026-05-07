import categoriesData from "@/data/categories.json";
import configData from "@/data/config.json";
import enginesData from "@/data/engines.json";
import type { Category, KeywordsFile, SearchEngine } from "@/lib/types";

export const categories = categoriesData as Category[];
export const engines = enginesData as SearchEngine[];
export const defaultEngineId = configData.defaultEngineId;

export async function loadAllKeywords(): Promise<Record<string, string[]>> {
  const entries = await Promise.all(
    categories.map(async (cat) => {
      try {
        const mod = await import(`@/data/keywords/${cat.id}.json`);
        return [cat.id, (mod.default as KeywordsFile).keywords] as const;
      } catch {
        return [cat.id, []] as const;
      }
    }),
  );
  return Object.fromEntries(entries);
}

export async function loadKeywords(
  categoryId: string,
): Promise<Record<string, string[]>> {
  try {
    const mod = await import(`@/data/keywords/${categoryId}.json`);
    return { [categoryId]: (mod.default as KeywordsFile).keywords };
  } catch {
    return { [categoryId]: [] };
  }
}
