import type { Category, ClickRecord } from "@/lib/types";

export type SortMode = "count" | "recent";

export function sortRecords<T extends ClickRecord>(
  records: T[],
  mode: SortMode,
): T[] {
  return [...records].sort((a, b) =>
    mode === "count" ? b.clickCount - a.clickCount : b.clickedAt - a.clickedAt,
  );
}

export interface CategoryGroup<T> {
  categoryName: string;
  items: T[];
}

export function groupByCategory<T extends { categoryId: string }>(
  items: T[],
  categories: Category[],
): Record<string, CategoryGroup<T>> {
  const map: Record<string, CategoryGroup<T>> = {};
  for (const item of items) {
    const cat = categories.find((c) => c.id === item.categoryId);
    const group = map[item.categoryId];
    if (!group) {
      map[item.categoryId] = {
        categoryName: cat?.name ?? item.categoryId,
        items: [item],
      };
    } else {
      group.items.push(item);
    }
  }
  return map;
}

export function getClicksByCategory(
  clickHistory: ClickRecord[],
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const r of clickHistory) {
    map[r.categoryId] = (map[r.categoryId] ?? 0) + r.clickCount;
  }
  return map;
}
