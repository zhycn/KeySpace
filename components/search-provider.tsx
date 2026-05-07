"use client";

import { useTranslations } from "next-intl";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { addClickRecord, loadUserData, setSelectedEngine } from "@/lib/storage";
import type { Category, ClickRecord, SearchEngine } from "@/lib/types";

interface SearchState {
  searchQuery: string;
  selectedEngineId: string;
  clickHistory: ClickRecord[];
}

interface SearchActions {
  setSearchQuery: (q: string) => void;
  handleKeywordClick: (keyword: string, categoryId: string) => void;
  handleSetEngine: (engineId: string) => void;
}

interface SearchStaticData {
  categories: Category[];
  engines: SearchEngine[];
}

type SearchContextType = SearchState & SearchActions & SearchStaticData;

const SearchContext = createContext<SearchContextType | null>(null);

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}

interface SearchProviderProps {
  categories: Category[];
  engines: SearchEngine[];
  defaultEngineId: string;
  children: React.ReactNode;
}

export function SearchProvider({
  categories,
  engines,
  defaultEngineId,
  children,
}: SearchProviderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [clickHistory, setClickHistory] = useState<ClickRecord[]>([]);
  const [selectedEngineId, setSelectedEngineIdState] =
    useState(defaultEngineId);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("search");

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
      if (!engine) return;
      const url = engine.urlTemplate.replace(
        "{keyword}",
        encodeURIComponent(keyword),
      );
      const newWindow = window.open(url, "_blank");
      if (!newWindow) {
        toast.error(t("popupBlocked"), { description: t("popupBlockedDesc") });
      } else {
        toast.success(t("searchOpened"), {
          description: `${engine.name}: ${keyword}`,
        });
      }
      const updated = addClickRecord(keyword, categoryId);
      setClickHistory([...updated]);
    },
    [engines, selectedEngineId, t],
  );

  const handleSetEngine = useCallback((engineId: string) => {
    setSelectedEngine(engineId);
    setSelectedEngineIdState(engineId);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        selectedEngineId,
        clickHistory,
        categories,
        engines,
        setSearchQuery,
        handleKeywordClick,
        handleSetEngine,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
