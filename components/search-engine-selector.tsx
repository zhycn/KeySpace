"use client";

import { Check } from "lucide-react";
import { useSearch } from "@/components/search-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const engineBrands: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  google: {
    label: "G",
    bg: "bg-white dark:bg-gray-200",
    text: "text-blue-500",
  },
  bing: { label: "B", bg: "bg-blue-600", text: "text-white" },
  github: { label: "GH", bg: "bg-gray-800", text: "text-white" },
  duckduckgo: { label: "D", bg: "bg-orange-500", text: "text-white" },
  baidu: { label: "百", bg: "bg-blue-500", text: "text-white" },
};

export function SearchEngineSelector() {
  const { engines, selectedEngineId, handleSetEngine } = useSearch();
  const current = engines.find((e) => e.id === selectedEngineId) ?? engines[0];
  const brand = current ? engineBrands[current.id] : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`当前搜索引擎: ${current?.name ?? ""}，点击切换`}
          className="inline-flex items-center justify-center size-6 rounded-full text-[10px] font-bold shrink-0 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {brand ? (
            <span
              className={`inline-flex items-center justify-center size-full rounded-full ${brand.bg} ${brand.text}`}
            >
              {brand.label}
            </span>
          ) : (
            <span className="inline-flex items-center justify-center size-full rounded-full bg-muted text-muted-foreground">
              {current?.name?.charAt(0) ?? "?"}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1.5 gap-1">
        {engines.map((engine) => {
          const eBrand = engineBrands[engine.id];
          const isActive = engine.id === selectedEngineId;
          return (
            <button
              key={engine.id}
              type="button"
              onClick={() => handleSetEngine(engine.id)}
              className={`flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${isActive ? "bg-accent text-accent-foreground" : ""}`}
            >
              {eBrand ? (
                <span
                  className={`inline-flex items-center justify-center size-5 rounded-full text-[9px] font-bold shrink-0 ${eBrand.bg} ${eBrand.text}`}
                >
                  {eBrand.label}
                </span>
              ) : (
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-muted text-muted-foreground text-[9px] font-bold shrink-0">
                  {engine.name.charAt(0)}
                </span>
              )}
              <span className="flex-1 text-left">{engine.name}</span>
              {isActive && <Check className="size-4 text-muted-foreground" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
