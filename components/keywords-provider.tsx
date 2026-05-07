"use client";

import { createContext, useContext } from "react";

type KeywordsContextType = Record<string, string[]>;

const KeywordsContext = createContext<KeywordsContextType | null>(null);

export function useKeywordsMap() {
  const ctx = useContext(KeywordsContext);
  if (!ctx)
    throw new Error("useKeywordsMap must be used within KeywordsProvider");
  return ctx;
}

export function KeywordsProvider({
  keywordsMap,
  children,
}: {
  keywordsMap: Record<string, string[]>;
  children: React.ReactNode;
}) {
  return (
    <KeywordsContext.Provider value={keywordsMap}>
      {children}
    </KeywordsContext.Provider>
  );
}
