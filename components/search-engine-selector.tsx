"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearch } from "@/components/search-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { engineBrandClass, getEngineBrand } from "@/lib/engine-brands";
import { cn } from "@/lib/utils";

export function SearchEngineSelector() {
  const { engines, selectedEngineId, handleSetEngine } = useSearch();
  const current = engines.find((e) => e.id === selectedEngineId) ?? engines[0];
  const brand = current ? getEngineBrand(current.id) : null;
  const t = useTranslations("search");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("currentEngine", { name: current?.name ?? "" })}
          className="inline-flex items-center justify-center size-6 rounded-full text-[10px] font-bold shrink-0 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {brand && current ? (
            <span className={cn("size-full", engineBrandClass(current.id))}>
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
          const isActive = engine.id === selectedEngineId;
          return (
            <button
              key={engine.id}
              type="button"
              onClick={() => handleSetEngine(engine.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground",
              )}
            >
              <span className={engineBrandClass(engine.id, "sm")}>
                {getEngineBrand(engine.id)?.label ?? engine.name.charAt(0)}
              </span>
              <span className="flex-1 text-left">{engine.name}</span>
              {isActive && <Check className="size-4 text-muted-foreground" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
