export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface KeywordsFile {
  categoryId: string;
  keywords: string[];
}

export interface SearchEngine {
  id: string;
  name: string;
  icon?: string;
  urlTemplate: string;
}

export interface ProjectConfig {
  siteName: string;
  defaultEngineId: string;
}

export interface ClickRecord {
  keyword: string;
  categoryId: string;
  clickedAt: number;
  clickCount: number;
}

export interface UserStorage {
  favorites: string[];
  clickHistory: ClickRecord[];
  selectedEngineId: string;
  sidebarCollapsed: boolean;
}

export type ViewMode = "home" | "favorites" | "category";
