import type { ClickRecord, UserStorage } from "./types";

const STORAGE_KEY = "keyspace-user-data";
const MAX_HISTORY = 200;

const defaultData: UserStorage = {
  clickHistory: [],
  selectedEngineId: "google",
};

let cachedData: UserStorage | null = null;

export function loadUserData(): UserStorage {
  if (typeof window === "undefined") return defaultData;
  if (cachedData) return cachedData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const result: UserStorage = { ...defaultData };
      cachedData = result;
      return result;
    }
    const result: UserStorage = { ...defaultData, ...JSON.parse(raw) };
    cachedData = result;
    return result;
  } catch {
    const result: UserStorage = { ...defaultData };
    cachedData = result;
    return result;
  }
}

export function saveUserData(data: UserStorage): void {
  if (typeof window === "undefined") return;
  cachedData = data;
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
  if (data.clickHistory.length > MAX_HISTORY) {
    data.clickHistory = data.clickHistory
      .sort((a, b) => b.clickedAt - a.clickedAt)
      .slice(0, MAX_HISTORY);
  }
  saveUserData(data);
  return data.clickHistory;
}

export function setSelectedEngine(engineId: string): void {
  const data = loadUserData();
  data.selectedEngineId = engineId;
  saveUserData(data);
}
