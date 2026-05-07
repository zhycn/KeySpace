import type { ClickRecord, UserStorage } from "./types";

const STORAGE_KEY = "keyspace-user-data";

const defaultData: UserStorage = {
  clickHistory: [],
  selectedEngineId: "google",
};

export function loadUserData(): UserStorage {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

export function saveUserData(data: UserStorage): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addClickRecord(
  keyword: string,
  categoryId: string,
): ClickRecord[] {
  const data = loadUserData();
  const existing = data.clickHistory.find(
    (r) => r.keyword === keyword && r.categoryId === categoryId,
  );
  if (existing) {
    existing.clickCount += 1;
    existing.clickedAt = Date.now();
  } else {
    data.clickHistory.push({
      keyword,
      categoryId,
      clickedAt: Date.now(),
      clickCount: 1,
    });
  }
  saveUserData(data);
  return data.clickHistory;
}

export function removeClickRecord(
  keyword: string,
  categoryId: string,
): ClickRecord[] {
  const data = loadUserData();
  data.clickHistory = data.clickHistory.filter(
    (r) => !(r.keyword === keyword && r.categoryId === categoryId),
  );
  saveUserData(data);
  return data.clickHistory;
}

export function setSelectedEngine(engineId: string): void {
  const data = loadUserData();
  data.selectedEngineId = engineId;
  saveUserData(data);
}
