import { cn } from "@/lib/utils";

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

export function getEngineBrand(engineId: string) {
  return engineBrands[engineId] ?? null;
}

export function engineBrandClass(engineId: string, size: "sm" | "md" = "md") {
  const brand = getEngineBrand(engineId);
  const sizeClass = size === "sm" ? "size-5 text-[9px]" : "size-6 text-[10px]";
  if (brand) {
    return cn(
      "inline-flex items-center justify-center rounded-full font-bold shrink-0",
      sizeClass,
      brand.bg,
      brand.text,
    );
  }
  return cn(
    "inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground font-bold shrink-0",
    sizeClass,
  );
}
