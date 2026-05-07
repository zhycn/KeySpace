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
} from "@/lib/storage";
import { toast } from "sonner";
import type {
  Category,
  ClickRecord,
  SearchEngine,
  ViewMode,
} from "@/lib/types";

interface AppState {
  viewMode: ViewMode;
  currentCategoryId: string | null;
  searchQuery: string;
  categories: Category[];
  engines: SearchEngine[];
  clickHistory: ClickRecord[];
  selectedEngineId: string;
  keywordsMap: Record<string, string[]>;
}

interface AppActions {
  setViewMode: (mode: ViewMode) => void;
  setCurrentCategoryId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  handleKeywordClick: (keyword: string, categoryId: string) => void;
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
  keywordsMap: Record<string, string[]>;
  children: React.ReactNode;
}

export function AppProvider({
  categories,
  engines,
  defaultEngineId,
  keywordsMap,
  children,
}: AppProviderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [clickHistory, setClickHistory] = useState<ClickRecord[]>([]);
  const [selectedEngineId, setSelectedEngineIdState] =
    useState(defaultEngineId);
  const [mounted, setMounted] = useState(false);
  const [keywordsMapState] = useState<Record<string, string[]>>(keywordsMap);

  useEffect(() => {
    const data = loadUserData();
    setClickHistory(data.clickHistory);
    setSelectedEngineIdState(data.selectedEngineId || defaultEngineId);
    setMounted(true);
  }, [defaultEngineId]);

  const handleKeywordClick = useCallback(
    (keyword: string, categoryId: string) => {
      const engine =
        engines.find((e) => e.id === selectedEngineId) || engines[0];
      const url = engine.urlTemplate.replace(
        "{keyword}",
        encodeURIComponent(keyword),
      );
      const newWindow = window.open(url, "_blank");
      if (!newWindow) {
        toast.error("弹窗被拦截", { description: "请允许浏览器弹窗后重试" });
      } else {
        toast.success("已在新标签页打开搜索", {
          description: `${engine.name}: ${keyword}`,
        });
      }
      const updated = addClickRecord(keyword, categoryId);
      setClickHistory([...updated]);
    },
    [engines, selectedEngineId],
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
        clickHistory,
        selectedEngineId,
        keywordsMap: keywordsMapState,
        setViewMode,
        setCurrentCategoryId,
        setSearchQuery,
        handleKeywordClick,
        handleRemoveClickRecord,
        handleSetEngine,
      }}
    >
      {mounted ? children : null}
    </AppContext.Provider>
  );
}
