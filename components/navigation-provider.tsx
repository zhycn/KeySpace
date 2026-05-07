"use client";

import { createContext, useContext, useState } from "react";
import type { ViewMode } from "@/lib/types";

interface NavigationState {
  viewMode: ViewMode;
  currentCategoryId: string | null;
}

interface NavigationActions {
  setViewMode: (mode: ViewMode) => void;
  setCurrentCategoryId: (id: string | null) => void;
}

type NavigationContextType = NavigationState & NavigationActions;

const NavigationContext = createContext<NavigationContextType | null>(null);

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx)
    throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(
    null,
  );

  return (
    <NavigationContext.Provider
      value={{ viewMode, currentCategoryId, setViewMode, setCurrentCategoryId }}
    >
      {children}
    </NavigationContext.Provider>
  );
}
