"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  addClickRecord,
  loadUserData,
  removeClickRecord,
  setSelectedEngine,
  toggleFavorite,
} from "@/lib/storage";
import type {
  Category,
  ClickRecord,
  FavoriteItem,
  SearchEngine,
  ViewMode,
} from "@/lib/types";

interface AppState {
  viewMode: ViewMode;
  currentCategoryId: string | null;
  searchQuery: string;
  categories: Category[];
  engines: SearchEngine[];
  favorites: FavoriteItem[];
  clickHistory: ClickRecord[];
  selectedEngineId: string;
}

interface AppActions {
  setViewMode: (mode: ViewMode) => void;
  setCurrentCategoryId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  handleKeywordClick: (keyword: string, categoryId: string) => void;
  handleToggleFavorite: (keyword: string, categoryId: string) => void;
  isFavorite: (keyword: string, categoryId: string) => boolean;
  handleRemoveClickRecord: (keyword: string, categoryId: string) => void;
  handleSetEngine: (engineId: string) => void;
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

export function AppProvider({
  categories,
  engines,
  defaultEngineId,
  children,
}: AppProviderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [clickHistory, setClickHistory] = useState<ClickRecord[]>([]);
  const [selectedEngineId, setSelectedEngineIdState] =
    useState(defaultEngineId);

  useEffect(() => {
    const data = loadUserData();
    setFavorites(data.favorites);
    setClickHistory(data.clickHistory);
    setSelectedEngineIdState(data.selectedEngineId || defaultEngineId);
  }, [defaultEngineId]);

  const handleKeywordClick = useCallback(
    (keyword: string, categoryId: string) => {
      const engine =
        engines.find((e) => e.id === selectedEngineId) || engines[0];
      const url = engine.urlTemplate.replace(
        "{keyword}",
        encodeURIComponent(keyword),
      );
      window.open(url, "_blank");
      const updated = addClickRecord(keyword, categoryId);
      setClickHistory([...updated]);
    },
    [engines, selectedEngineId],
  );

  const handleToggleFavorite = useCallback(
    (keyword: string, categoryId: string) => {
      const updated = toggleFavorite(keyword, categoryId);
      setFavorites([...updated]);
    },
    [],
  );

  const isFavorite = useCallback(
    (keyword: string, categoryId: string) =>
      favorites.some(
        (f) => f.keyword === keyword && f.categoryId === categoryId,
      ),
    [favorites],
  );

  const handleRemoveClickRecord = useCallback(
    (keyword: string, categoryId: string) => {
      const updated = removeClickRecord(keyword, categoryId);
      setClickHistory([...updated]);
    },
    [],
  );

  const handleSetEngine = useCallback((engineId: string) => {
    setSelectedEngine(engineId);
    setSelectedEngineIdState(engineId);
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
        setViewMode,
        setCurrentCategoryId,
        setSearchQuery,
        handleKeywordClick,
        handleToggleFavorite,
        isFavorite,
        handleRemoveClickRecord,
        handleSetEngine,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
