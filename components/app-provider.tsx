"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Category, ClickRecord, SearchEngine, ViewMode } from "@/lib/types";
import {
  addClickRecord,
  loadUserData,
  removeClickRecord,
  setSelectedEngine,
  setSidebarCollapsed,
  toggleFavorite,
} from "@/lib/storage";

interface AppState {
  viewMode: ViewMode;
  currentCategoryId: string | null;
  searchQuery: string;
  categories: Category[];
  engines: SearchEngine[];
  favorites: string[];
  clickHistory: ClickRecord[];
  selectedEngineId: string;
  sidebarCollapsed: boolean;
}

interface AppActions {
  setViewMode: (mode: ViewMode) => void;
  setCurrentCategoryId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  handleKeywordClick: (keyword: string, categoryId: string) => void;
  handleToggleFavorite: (keyword: string) => void;
  handleRemoveClickRecord: (keyword: string, categoryId: string) => void;
  handleSetEngine: (engineId: string) => void;
  handleSetSidebarCollapsed: (collapsed: boolean) => void;
}

type AppContextType = AppState & AppActions;

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

interface AppProviderProps {
  categories: Category[];
  engines: SearchEngine[];
  defaultEngineId: string;
  children: React.ReactNode;
}

export function AppProvider({ categories, engines, defaultEngineId, children }: AppProviderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [clickHistory, setClickHistory] = useState<ClickRecord[]>([]);
  const [selectedEngineId, setSelectedEngineIdState] = useState(defaultEngineId);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);

  useEffect(() => {
    const data = loadUserData();
    setFavorites(data.favorites);
    setClickHistory(data.clickHistory);
    setSelectedEngineIdState(data.selectedEngineId || defaultEngineId);
    setSidebarCollapsedState(data.sidebarCollapsed);
  }, [defaultEngineId]);

  const handleKeywordClick = useCallback(
    (keyword: string, categoryId: string) => {
      const engine = engines.find((e) => e.id === selectedEngineId) || engines[0];
      const url = engine.urlTemplate.replace("{keyword}", encodeURIComponent(keyword));
      window.open(url, "_blank");
      const updated = addClickRecord(keyword, categoryId);
      setClickHistory([...updated]);
    },
    [engines, selectedEngineId],
  );

  const handleToggleFavorite = useCallback((keyword: string) => {
    const updated = toggleFavorite(keyword);
    setFavorites([...updated]);
  }, []);

  const handleRemoveClickRecord = useCallback((keyword: string, categoryId: string) => {
    const updated = removeClickRecord(keyword, categoryId);
    setClickHistory([...updated]);
  }, []);

  const handleSetEngine = useCallback((engineId: string) => {
    setSelectedEngine(engineId);
    setSelectedEngineIdState(engineId);
  }, []);

  const handleSetSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    setSidebarCollapsedState(collapsed);
  }, []);

  return (
    <AppContext.Provider
      value={{
        viewMode,
        currentCategoryId,
        searchQuery,
        categories,
        engines,
        favorites,
        clickHistory,
        selectedEngineId,
        sidebarCollapsed,
        setViewMode,
        setCurrentCategoryId,
        setSearchQuery,
        handleKeywordClick,
        handleToggleFavorite,
        handleRemoveClickRecord,
        handleSetEngine,
        handleSetSidebarCollapsed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
