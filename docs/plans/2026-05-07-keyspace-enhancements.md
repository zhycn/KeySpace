# KeySpace Enhancements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 KeySpace 从 MVP 升级为可用产品 — 首页引导、全局搜索、数据扩充、点击反馈、收藏分组、键盘快捷键

**Architecture:** 现有 RSC + 客户端状态架构不变，增强搜索为跨分类全局搜索，首页增加分类卡片引导，关键词数据大幅扩充，点击反馈使用 Sonner Toast，收藏按分类分组展示

**Tech Stack:** Next.js 16 + React 19 + shadcn/ui + Sonner + fuse.js + Tailwind CSS v4

---

## Task 1: 安装 Sonner Toast 组件

**Files:**
- Create: `components/ui/sonner.tsx` (via shadcn CLI)
- Modify: `app/layout.tsx` (添加 `<Toaster />`)

**Step 1: 安装 sonner**

Run: `npx shadcn@latest add sonner`

**Step 2: 在 layout.tsx 添加 Toaster**

在 `app/layout.tsx` 的 `<body>` 内 `<TooltipProvider>` 之后添加：

```tsx
<Toaster />
```

需要 import: `import { Toaster } from "@/components/ui/sonner";`

**Step 3: 验证构建**

Run: `pnpm build`

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add Sonner toast component"
```

---

## Task 2: 关键词点击反馈 — Toast + 弹窗拦截检测

**Files:**
- Modify: `components/app-provider.tsx` (handleKeywordClick 添加 Toast 和拦截检测)
- Modify: `components/keyword-tag.tsx` (添加 active:scale-95 动画)

**Step 1: 修改 app-provider.tsx — handleKeywordClick 添加反馈**

在 `handleKeywordClick` 中：

```tsx
import { toast } from "sonner";

const handleKeywordClick = useCallback(
  (keyword: string, categoryId: string) => {
    const engine = engines.find((e) => e.id === selectedEngineId) || engines[0];
    const url = engine.urlTemplate.replace("{keyword}", encodeURIComponent(keyword));
    const newWindow = window.open(url, "_blank");
    if (!newWindow) {
      toast.error("弹窗被拦截", { description: "请允许浏览器弹窗后重试" });
    } else {
      toast.success("已在新标签页打开搜索", { description: `${engine.name}: ${keyword}` });
    }
    const updated = addClickRecord(keyword, categoryId);
    setClickHistory([...updated]);
  },
  [engines, selectedEngineId],
);
```

**Step 2: 修改 keyword-tag.tsx — 添加点击缩放动画**

给关键词 Button 添加 `active:scale-95 transition-transform`：

```tsx
<Button
  variant="outline"
  className="h-8 rounded-r-none pr-2 active:scale-95 transition-transform"
  onClick={() => handleKeywordClick(keyword, categoryId)}
>
  {keyword}
</Button>
```

**Step 3: 验证构建**

Run: `pnpm build`

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: keyword click feedback with toast and popup blocker detection"
```

---

## Task 3: 全局搜索 — 跨分类关键词搜索

**Files:**
- Modify: `components/app-provider.tsx` (添加 keywordsMap 到 state)
- Modify: `app/page.tsx` (传递 keywordsMap 到 AppProvider)
- Modify: `app/layout.tsx` (AppProvider 接收 keywordsMap)
- Modify: `components/main-content.tsx` (搜索有结果时切换到全局搜索结果视图)
- Create: `components/global-search-results.tsx` (全局搜索结果组件)

**Step 1: 修改 types — AppProvider 接收 keywordsMap**

在 `app-provider.tsx` 的 `AppProviderProps` 中添加 `keywordsMap: Record<string, string[]>`，并在 state 中存储。

`AppState` interface 添加：
```ts
keywordsMap: Record<string, string[]>;
```

`AppProviderProps` 添加 `keywordsMap` prop，并在组件中：
```ts
const [keywordsMap] = useState<Record<string, string[]>>(props.keywordsMap);
```

**Step 2: 修改 app/layout.tsx — AppProvider 需要移到 page.tsx**

由于 keywordsMap 是 RSC 在 page.tsx 中 async 获取的，AppProvider 需要从 layout.tsx 移到 page.tsx，或者将 keywordsMap 通过 props 传入。

最佳方案：将 AppProvider 从 layout 移到 page.tsx，因为 keywordsMap 是异步数据。

修改 `app/page.tsx`：
```tsx
import { AppProvider } from "@/components/app-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { MainContent } from "@/components/main-content";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import categoriesData from "@/data/categories.json";
import configData from "@/data/config.json";
import enginesData from "@/data/engines.json";
import type { Category, SearchEngine } from "@/lib/types";

const categories = categoriesData as Category[];
const engines = enginesData as SearchEngine[];

async function loadAllKeywords(): Promise<Record<string, string[]>> {
  const entries = await Promise.all(
    categories.map(async (cat) => {
      try {
        const mod = await import(`@/data/keywords/${cat.id}.json`);
        return [cat.id, (mod.default as KeywordsFile).keywords] as const;
      } catch {
        return [cat.id, []] as const;
      }
    }),
  );
  return Object.fromEntries(entries);
}

export default async function Home() {
  const keywordsMap = await loadAllKeywords();

  return (
    <AppProvider
      categories={categories}
      engines={engines}
      defaultEngineId={configData.defaultEngineId}
      keywordsMap={keywordsMap}
    >
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <MainContent keywordsMap={keywordsMap} />
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </AppProvider>
  );
}
```

修改 `app/layout.tsx` — 移除 AppProvider/TooltipProvider，只保留基础布局和主题脚本：
```tsx
import type { Metadata } from "next";
import "./globals.css";
import configData from "@/data/config.json";

export const metadata: Metadata = {
  title: configData.siteName,
  description: "关键词导航工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased font-sans" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('keyspace-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch{}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

**Step 3: 创建 global-search-results.tsx**

```tsx
"use client";

import Fuse from "fuse.js";
import { useMemo } from "react";
import { useApp } from "@/components/app-provider";
import { KeywordTag } from "@/components/keyword-tag";

export function GlobalSearchResults() {
  const { searchQuery, keywordsMap, categories } = useApp();

  const results = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const allItems: { keyword: string; categoryId: string; categoryName: string }[] = [];
    for (const [catId, kws] of Object.entries(keywordsMap)) {
      const cat = categories.find((c) => c.id === catId);
      for (const kw of kws) {
        allItems.push({ keyword: kw, categoryId: catId, categoryName: cat?.name ?? catId });
      }
    }

    const fuse = new Fuse(allItems, { threshold: 0.3, keys: ["keyword"] });
    const matched = fuse.search(searchQuery).map((r) => r.item);

    const grouped: Record<string, { categoryName: string; items: { keyword: string; categoryId: string }[] }> = {};
    for (const item of matched) {
      if (!grouped[item.categoryId]) {
        grouped[item.categoryId] = { categoryName: item.categoryName, items: [] };
      }
      grouped[item.categoryId].items.push({ keyword: item.keyword, categoryId: item.categoryId });
    }

    return grouped;
  }, [searchQuery, keywordsMap, categories]);

  if (!results || Object.keys(results).length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <p className="text-muted-foreground">没有匹配的关键词</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(results).map(([catId, group]) => (
        <div key={catId} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">{group.categoryName}</h3>
          <div className="flex flex-wrap gap-3">
            {group.items.map((item) => (
              <KeywordTag key={item.keyword} keyword={item.keyword} categoryId={item.categoryId} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 4: 修改 main-content.tsx — 搜索时显示全局结果**

当 searchQuery 非空时，在首页和分类视图上方显示全局搜索结果：

```tsx
<main className="flex-1 overflow-auto p-6">
  {searchQuery.trim() ? (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">搜索结果</h2>
      <GlobalSearchResults />
    </div>
  ) : (
    <>
      {viewMode === "home" && <HomeView />}
      {viewMode === "favorites" && <FavoritesView />}
      {viewMode === "category" && currentCategory && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{currentCategory.name}</h2>
          <KeywordGrid keywords={currentKeywords} categoryId={currentCategory.id} />
        </div>
      )}
    </>
  )}
</main>
```

**Step 5: 从 HomeView / FavoritesView / KeywordGrid 中移除各自的 fuse.js 搜索逻辑**

- `HomeView`: 移除 `filtered` useMemo，直接使用 `topKeywords`（搜索已由全局处理）
- `FavoritesView`: 移除 `filtered` useMemo，直接使用 `favorites`
- `KeywordGrid`: 移除 `filtered` useMemo，直接使用 `keywords`
- 注意：FavoritesView 仍需保留搜索过滤，因为收藏视图搜索应该只搜收藏（不在全局搜索范围内）。改为：搜索时只过滤收藏视图，不走全局搜索。

实际上重新考虑：全局搜索只在首页和分类视图生效，收藏视图搜索仍然只搜收藏列表。修改 main-content.tsx：

```tsx
<main className="flex-1 overflow-auto p-6">
  {viewMode === "home" && (searchQuery.trim() ? (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">搜索结果</h2>
      <GlobalSearchResults />
    </div>
  ) : (
    <HomeView />
  ))}
  {viewMode === "favorites" && <FavoritesView />}
  {viewMode === "category" && (searchQuery.trim() ? (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">搜索结果</h2>
      <GlobalSearchResults />
    </div>
  ) : (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{currentCategory.name}</h2>
      <KeywordGrid keywords={currentKeywords} categoryId={currentCategory.id} />
    </div>
  ))}
</main>
```

这样更简洁。HomeView 和 KeywordGrid 中移除搜索逻辑（因为搜索时显示全局结果）。FavoritesView 保留自己的搜索。

**Step 6: 验证构建**

Run: `pnpm build`

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: global search across all categories with grouped results"
```

---

## Task 4: 首页分类卡片引导

**Files:**
- Modify: `components/home-view.tsx` (添加分类卡片入口区域)

**Step 1: 修改 home-view.tsx — 添加分类卡片**

在首页顶部添加分类入口卡片区域。当点击历史为空时，分类卡片占主要位置；有历史时，分类卡片缩小为次要区域。

```tsx
"use client";

import { FolderOpen, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { KeywordTag } from "@/components/keyword-tag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function HomeView() {
  const { clickHistory, handleRemoveClickRecord, categories, keywordsMap, setViewMode, setCurrentCategoryId } = useApp();
  const [sortMode, setSortMode] = useState<"count" | "recent">("count");

  const topKeywords = useMemo(() => {
    const sorted = [...clickHistory].sort((a, b) =>
      sortMode === "count" ? b.clickCount - a.clickCount : b.clickedAt - a.clickedAt,
    );
    return sorted.slice(0, 30);
  }, [clickHistory, sortMode]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">分类浏览</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const count = keywordsMap[cat.id]?.length ?? 0;
            return (
              <Button
                key={cat.id}
                variant="outline"
                className="h-auto flex flex-col items-center gap-2 py-4"
                onClick={() => {
                  setCurrentCategoryId(cat.id);
                  setViewMode("category");
                }}
              >
                <FolderOpen className="size-6 text-muted-foreground" />
                <span className="font-medium">{cat.name}</span>
                <Badge variant="secondary">{count}个关键词</Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {clickHistory.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {sortMode === "count" ? "热门关键词" : "最近点击"}
            </h2>
            <ToggleGroup
              type="single"
              value={sortMode}
              onValueChange={(v) => { if (v) setSortMode(v as "count" | "recent"); }}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="count">按点击数</ToggleGroupItem>
              <ToggleGroupItem value="recent">按最新</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex flex-wrap gap-2">
            {topKeywords.map((r) => (
              <div key={`${r.keyword}-${r.categoryId}`} className="group inline-flex items-center gap-1.5">
                <KeywordTag keyword={r.keyword} categoryId={r.categoryId} />
                <Badge variant="secondary">{r.clickCount}次</Badge>
                <Button
                  variant="destructive"
                  size="icon"
                  aria-label="删除记录"
                  className="hidden group-hover:flex group-focus-within:flex size-5 rounded-full"
                  onClick={() => handleRemoveClickRecord(r.keyword, r.categoryId)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: 验证构建**

Run: `pnpm build`

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: category card grid on homepage for new user onboarding"
```

---

## Task 5: 收藏视图按分类分组

**Files:**
- Modify: `components/favorites-view.tsx` (按分类分组展示)

**Step 1: 修改 favorites-view.tsx**

```tsx
"use client";

import Fuse from "fuse.js";
import { useMemo } from "react";
import { useApp } from "@/components/app-provider";
import { KeywordTag } from "@/components/keyword-tag";

export function FavoritesView() {
  const { favorites, searchQuery, categories } = useApp();

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    const fuse = new Fuse(favorites, { threshold: 0.3, keys: ["keyword"] });
    return fuse.search(searchQuery).map((r) => r.item);
  }, [favorites, searchQuery]);

  const grouped = useMemo(() => {
    const map: Record<string, { categoryName: string; items: typeof filtered }> = {};
    for (const fav of filtered) {
      const cat = categories.find((c) => c.id === fav.categoryId);
      if (!map[fav.categoryId]) {
        map[fav.categoryId] = { categoryName: cat?.name ?? fav.categoryId, items: [] };
      }
      map[fav.categoryId].items.push(fav);
    }
    return map;
  }, [filtered, categories]);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">收藏关键词</h2>
        <div className="flex flex-col items-center gap-2 py-12">
          <p className="text-muted-foreground">
            {favorites.length === 0 ? "暂无收藏" : "没有匹配的收藏"}
          </p>
          {favorites.length === 0 && (
            <p className="text-sm text-muted-foreground">点击关键词旁的星标添加</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">收藏关键词</h2>
      {Object.entries(grouped).map(([catId, group]) => (
        <div key={catId} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">{group.categoryName}</h3>
          <div className="flex flex-wrap gap-3">
            {group.items.map((fav) => (
              <KeywordTag key={`${fav.keyword}-${fav.categoryId}`} keyword={fav.keyword} categoryId={fav.categoryId} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 2: 验证构建**

Run: `pnpm build`

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: group favorites by category"
```

---

## Task 6: 键盘快捷键 — Cmd/Ctrl+K 聚焦搜索 + Escape 清空

**Files:**
- Modify: `components/search-input.tsx` (添加键盘快捷键)

**Step 1: 修改 search-input.tsx**

```tsx
"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useApp } from "@/components/app-provider";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export function SearchInput() {
  const { searchQuery, setSearchQuery } = useApp();
  const hasQuery = searchQuery.length > 0;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setSearchQuery("");
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setSearchQuery]);

  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        ref={inputRef}
        aria-label="搜索关键词"
        placeholder="搜索关键词... ⌘K"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {hasQuery && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label="清除搜索"
            onClick={() => setSearchQuery("")}
          >
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
```

**Step 2: 验证构建**

Run: `pnpm build`

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: Cmd/Ctrl+K to focus search, Escape to clear and blur"
```

---

## Task 7: 数据扩充 — 新增分类与关键词

**Files:**
- Modify: `data/categories.json` (新增 5 个分类)
- Create: `data/keywords/social-media-marketing.json`
- Create: `data/keywords/e-commerce.json`
- Create: `data/keywords/data-analytics.json`
- Create: `data/keywords/brand-marketing.json`
- Create: `data/keywords/short-video.json`
- Modify: `data/keywords/seo.json` (扩充到 30+ 词)
- Modify: `data/keywords/sem.json` (扩充到 30+ 词)
- Modify: `data/keywords/content-marketing.json` (扩充到 30+ 词)

**Step 1: 更新 categories.json**

```json
[
  { "id": "seo", "name": "SEO优化", "icon": "Search" },
  { "id": "sem", "name": "SEM推广", "icon": "MousePointerClick" },
  { "id": "content-marketing", "name": "内容营销", "icon": "FileText" },
  { "id": "social-media-marketing", "name": "社交媒体营销", "icon": "Share2" },
  { "id": "e-commerce", "name": "电商运营", "icon": "ShoppingCart" },
  { "id": "data-analytics", "name": "数据分析", "icon": "BarChart3" },
  { "id": "brand-marketing", "name": "品牌营销", "icon": "Award" },
  { "id": "short-video", "name": "短视频营销", "icon": "Video" }
]
```

**Step 2: 创建 5 个新关键词文件**

`data/keywords/social-media-marketing.json`:
```json
{
  "categoryId": "social-media-marketing",
  "keywords": [
    "社交媒体运营", "粉丝增长", "社群管理", "话题营销", "KOL合作",
    "用户互动率", "社交聆听", "内容分发", "私域流量", "公众号运营",
    "微博营销", "小红书种草", "知乎营销", "裂变营销", "社交电商",
    "达人合作", "直播带货", "短视频运营", "图文种草", "粉丝画像",
    "社交广告", "信息流广告", "朋友圈广告", "社群裂变", "用户生成内容",
    "社交指标", "转发率", "评论互动", "关注转化", "社交影响力",
    "账号矩阵", "多平台运营", "内容调性", "品牌人设"
  ]
}
```

`data/keywords/e-commerce.json`:
```json
{
  "categoryId": "e-commerce",
  "keywords": [
    "店铺运营", "商品上架", "详情页优化", "转化率优化", "客单价",
    "复购率", "DSR评分", "直通车", "钻展", "超级推荐",
    "淘客推广", "活动策划", "双十一大促", "618大促", "聚划算",
    "库存管理", "SKU规划", "价格策略", "竞品分析", "流量入口",
    "搜索排名", "类目运营", "评价管理", "客服转化", "物流体验",
    "选品策略", "爆款打造", "关联销售", "加购率", "收藏加购",
    "店铺装修", "品牌旗舰店", "跨境电商", "直播电商"
  ]
}
```

`data/keywords/data-analytics.json`:
```json
{
  "categoryId": "data-analytics",
  "keywords": [
    "数据看板", "转化漏斗", "用户画像", "留存分析", "DAU/MAU",
    "跳出率", "页面停留时长", "UV/PV", "归因分析", "A/B测试",
    "数据埋点", "事件追踪", "用户分群", "同期群分析", "LTV",
    "CAC", "ROI分析", "数据可视化", "报表自动化", "数据仓库",
    "ETL流程", "指标体系", "北极星指标", "环比同比", "数据治理",
    "实时监控", "异常检测", "预测模型", "用户行为分析", "热力图分析",
    "路径分析", "渠道分析", "GMV分析", "流量分析"
  ]
}
```

`data/keywords/brand-marketing.json`:
```json
{
  "categoryId": "brand-marketing",
  "keywords": [
    "品牌定位", "品牌故事", "视觉识别", "品牌调性", "品牌传播",
    "品牌升级", "品牌联名", "IP营销", "情感营销", "价值观营销",
    "品牌认知度", "品牌美誉度", "品牌忠诚度", "品牌资产", "品牌延伸",
    "危机公关", "口碑营销", "体验营销", "事件营销", "公益营销",
    "品牌矩阵", "子品牌策略", "品牌焕新", "年轻化营销", "国潮营销",
    "品牌代言人", "品牌片", "户外广告", "整合营销", "全渠道营销",
    "品牌触点", "品牌体验", "品牌差异", "心智占位"
  ]
}
```

`data/keywords/short-video.json`:
```json
{
  "categoryId": "short-video",
  "keywords": [
    "短视频制作", "脚本策划", "拍摄技巧", "剪辑软件", "抖音运营",
    "快手运营", "视频号运营", "B站运营", "竖屏视频", "横屏视频",
    "视频封面", "标题文案", "话题标签", "完播率", "点赞率",
    "评论率", "转发率", "粉丝转化", "直播预热", "短视频带货",
    "信息流投放", "Dou+投放", "创作灵感", "热点追踪", "原创内容",
    "混剪视频", "口播视频", "剧情视频", "教程视频", "测评视频",
    "Vlog", "系列内容", "更新频率", "账号定位"
  ]
}
```

**Step 3: 扩充现有 3 个关键词文件到 30+ 词**

`data/keywords/seo.json` (新增 20 个):
```json
{
  "categoryId": "seo",
  "keywords": [
    "长尾关键词", "反向链接", "站内优化", "关键词密度", "外链建设",
    "页面权重", "爬虫抓取", "站点地图", "Meta标签", "内链策略",
    "域名权重", "索引收录", "核心关键词", "SERP排名", "结构化数据",
    "Canonical标签", "301重定向", "404页面", "Robots协议", "面包屑导航",
    "Alt属性", "页面加载速度", "移动端适配", "HTTPS证书", "富摘要",
    "知识图谱", "本地SEO", "E-E-A-T", "核心网页指标", "内容质量",
    "语义搜索", "搜索意图", "TF-IDF", "话题集群"
  ]
}
```

`data/keywords/sem.json` (新增 20 个):
```json
{
  "categoryId": "sem",
  "keywords": [
    "竞价排名", "关键词出价", "质量得分", "点击率", "展现量",
    "转化成本", "着陆页优化", "广告创意", "否定关键词", "广泛匹配",
    "精确匹配", "短语匹配", "广告排名", "日预算", "投放时段",
    "地域定向", "人群定向", "再营销", "广告扩展", "动态搜索广告",
    "购物广告", "展示广告", "视频广告", "应用推广", "智能出价",
    "目标ROAS", "目标CPA", "最大化点击", "搜索词报告", "转化跟踪",
    "归因模型", "竞价策略", "账户结构", "广告组优化"
  ]
}
```

`data/keywords/content-marketing.json` (新增 20 个):
```json
{
  "categoryId": "content-marketing",
  "keywords": [
    "内容策略", "内容日历", "选题策划", "标题优化", "内容分发",
    "原创内容", "UGC内容", "PGC内容", "信息图", "白皮书",
    "案例分析", "行业报告", "内容矩阵", "多渠道分发", "内容复用",
    "SEO写作", "用户意图", "内容漏斗", "品牌内容", "互动内容",
    "邮件营销", "电子书", "播客营销", "内容审计", "内容更新",
    "长篇内容", "短篇内容", "列表文章", "教程指南", "观点文章",
    "采访内容", "新闻稿", "内容效果衡量", "阅读完成率"
  ]
}
```

**Step 4: 修改 app-sidebar.tsx — 使用分类 icon 字段**

将 `FolderOpen` 替换为动态图标渲染。添加一个简单的图标映射：

```tsx
import { Award, BarChart3, FolderOpen, MousePointerClick, Search, Share2, ShoppingCart, Video, FileText } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Search, MousePointerClick, FileText, Share2, ShoppingCart, BarChart3, Award, Video,
};

// 在 SidebarMenuButton 中:
const Icon = (cat.icon && iconMap[cat.icon]) ? iconMap[cat.icon] : FolderOpen;
// ...
<Icon />
```

**Step 5: 验证构建**

Run: `pnpm build`

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: expand to 8 categories with 250+ keywords and category icons"
```

---

## Task 8: 清理 — 移除 HomeView 和 KeywordGrid 中冗余的搜索逻辑

**Files:**
- Modify: `components/home-view.tsx` (移除 fuse.js 导入和 filtered 计算)
- Modify: `components/keyword-grid.tsx` (移除 fuse.js 导入和 filtered 计算)

**Step 1: 简化 HomeView**

移除 `Fuse` import，移除 `filtered` useMemo。在 HomeView 中不显示搜索相关逻辑（搜索已由全局搜索处理）。注意 HomeView 已经在 Task 4 中重构过，这里确认没有冗余搜索代码。

**Step 2: 简化 KeywordGrid**

移除 `Fuse` import，移除 `filtered` useMemo 和 `searchQuery`。直接渲染所有关键词：

```tsx
"use client";

import { KeywordTag } from "@/components/keyword-tag";

interface KeywordGridProps {
  keywords: string[];
  categoryId: string;
}

export function KeywordGrid({ keywords, categoryId }: KeywordGridProps) {
  if (keywords.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <p className="text-muted-foreground">暂无关键词</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {keywords.map((kw) => (
        <KeywordTag key={kw} keyword={kw} categoryId={categoryId} />
      ))}
    </div>
  );
}
```

**Step 3: 验证构建**

Run: `pnpm build`

**Step 4: Commit**

```bash
git add -A && git commit -m "refactor: remove redundant search logic from HomeView and KeywordGrid"
```

---

## Execution Notes

- 每个 Task 独立，可并行执行的 Task: 1 & 6 & 5
- 有依赖关系的: Task 2 依赖 Task 1 (Sonner), Task 3 依赖 Task 1 (全局搜索用到 AppProvider 改造), Task 4 依赖 Task 3 (keywordsMap), Task 7 独立, Task 8 依赖 Task 3 & 4
- 建议执行顺序: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
- 或分组并行: (1+6+7) → (2+5) → (3) → (4+8)
