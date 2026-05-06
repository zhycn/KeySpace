"use client";

import { useApp } from "@/components/app-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SearchEngineSelector() {
  const { engines, selectedEngineId, handleSetEngine } = useApp();

  return (
    <Select value={selectedEngineId} onValueChange={handleSetEngine}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {engines.map((engine) => (
          <SelectItem key={engine.id} value={engine.id}>
            {engine.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
