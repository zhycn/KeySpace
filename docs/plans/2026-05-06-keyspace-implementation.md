# KeySpace 关键词导航工具 — 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个类 DeepSeek Chat 布局的关键词导航工具，左侧抽屉导航+右侧内容区，支持分类浏览、关键词搜索、点击搜索、收藏、历史记录。

**Architecture:** RSC 加载静态 JSON 数据（分类/关键词/搜索引擎/配置），客户端管理用户数据（收藏/点击历史/搜索引擎选择），localStorage 持久化。使用 shadcn/ui Sidebar 组件构建抽屉，fuse.js 做模糊搜索。

**Tech Stack:** Next.js 16 (App Router + RSC), React 19, shadcn/ui (radix-luma), Tailwind CSS v4, fuse.js, TypeScript

---

### Task 1: 类型定义与数据文件

**Files:**
- Create: `lib/types.ts`
- Create: `data/categories.json`
- Create: `data/keywords/seo.json`
- Create: `data/keywords/sem.json`
- Create: `data/keywords/content-marketing.json`
- Create: `data/engines.json`
- Create: `data/config.json`

**Step 1: 创建 TypeScript 类型定义**

```ts
// lib/types.ts
export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface KeywordsFile {
  categoryId: string;
  keywords: string[];
}

export interface SearchEngine {
  id: string;
  name: string;
  icon?: string;
  urlTemplate: string;
}

export interface ProjectConfig {
  siteName: string;
  defaultEngineId: string;
}

export interface ClickRecord {
  keyword: string;
  categoryId: string;
  clickedAt: number;
  clickCount: number;
}

export interface UserStorage {
  favorites: string[];
  clickHistory: ClickRecord[];
  selectedEngineId: string;
  sidebarCollapsed: boolean;
}

export type ViewMode = "home" | "favorites" | "category";
```

**Step 2: 创建示例数据文件**

`data/categories.json`:
```json
[
  { "id": "seo", "name": "SEO优化" },
  { "id": "sem", "name": "SEM推广" },
  { "id": "content-marketing", "name": "内容营销" }
]
```

`data/keywords/seo.json`:
```json
{
  "categoryId": "seo",
  "keywords": ["长尾关键词", "反向链接", "站内优化", "关键词密度", "外链建设", "页面权重", "爬虫抓取", "站点地图", "Meta标签", "内链策略", "域名权重", "索引收录", "核心关键词", "SERP排名", "结构化数据"]
}
```

`data/keywords/sem.json`:
```json
{
  "categoryId": "sem",
  "keywords": ["竞价排名", "质量得分", "广告创意", "点击率优化", "关键词出价", "落地页优化", "转化追踪", "广告组", "否定关键词", "展示网络", "搜索网络", "再营销", "广告扩展", "日预算", "投放时段"]
}
```

`data/keywords/content-marketing.json`:
```json
{
  "categoryId": "content-marketing",
  "keywords": ["内容策略", "用户画像", "内容日历", "品牌故事", "病毒营销", "KOL合作", "UGC内容", "短视频营销", "图文排版", "标题优化", "内容分发", "私域流量", "社群运营", "爆款内容", "内容复盘"]
}
```

`data/engines.json`:
```json
[
  { "id": "google", "name": "Google", "urlTemplate": "https://www.google.com/search?q={keyword}" },
  { "id": "bing", "name": "Bing", "urlTemplate": "https://www.bing.com/search?q={keyword}" },
  { "id": "github", "name": "GitHub", "urlTemplate": "https://github.com/search?q={keyword}" },
  { "id": "duckduckgo", "name": "DuckDuckGo", "urlTemplate": "https://duckduckgo.com/?q={keyword}" },
  { "id": "baidu", "name": "百度", "urlTemplate": "https://www.baidu.com/s?wd={keyword}" }
]
```

`data/config.json`:
```json
{
  "siteName": "KeySpace",
  "defaultEngineId": "google"
}
```

**Step 3: 验证数据文件格式**

Run: `npx tsc --noEmit lib/types.ts` 确认类型无误

**Step 4: Commit**

```bash
git add lib/types.ts data/
git commit -m "feat: add type definitions and sample data files"
```

---

### Task 2: localStorage 工具模块

**Files:**
- Create: `lib/storage.ts`

**Step 1: 实现 localStorage 读写工具**

```ts
// lib/storage.ts
import type { ClickRecord, UserStorage } from "./types";

const STORAGE_KEY = "keyspace-user-data";

const defaultData: UserStorage = {
  favorites: [],
  clickHistory: [],
  selectedEngineId: "google",
  sidebarCollapsed: false,
};

export function loadUserData(): UserStorage {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

export function saveUserData(data: UserStorage): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addClickRecord(keyword: string, categoryId: string): ClickRecord[] {
  const data = loadUserData();
  const existing = data.clickHistory.find(
    (r) => r.keyword === keyword && r.categoryId === categoryId
  );
  if (existing) {
    existing.clickCount += 1;
    existing.clickedAt = Date.now();
  } else {
    data.clickHistory.push({
      keyword,
      categoryId,
      clickedAt: Date.now(),
      clickCount: 1,
    });
  }
  saveUserData(data);
  return data.clickHistory;
}

export function toggleFavorite(keyword: string): string[] {
  const data = loadUserData();
  const idx = data.favorites.indexOf(keyword);
  if (idx >= 0) {
    data.favorites.splice(idx, 1);
  } else {
    data.favorites.push(keyword);
  }
  saveUserData(data);
  return data.favorites;
}

export function removeClickRecord(keyword: string, categoryId: string): ClickRecord[] {
  const data = loadUserData();
  data.clickHistory = data.clickHistory.filter(
    (r) => !(r.keyword === keyword && r.categoryId === categoryId)
  );
  saveUserData(data);
  return data.clickHistory;
}

export function setSelectedEngine(engineId: string): void {
  const data = loadUserData();
  data.selectedEngineId = engineId;
  saveUserData(data);
}

export function setSidebarCollapsed(collapsed: boolean): void {
  const data = loadUserData();
  data.sidebarCollapsed = collapsed;
  saveUserData(data);
}
```

**Step 2: Commit**

```bash
git add lib/storage.ts
git commit -m "feat: add localStorage utility for user data"
```

---

### Task 3: 安装 shadcn Sidebar 组件与 fuse.js

**Files:**
- Modify: `package.json` (新增依赖)

**Step 1: 安装 shadcn sidebar 组件**

Run: `npx shadcn@latest add sidebar`

**Step 2: 安装 fuse.js**

Run: `pnpm add fuse.js`

**Step 3: 验证安装**

Run: `pnpm build` 确认无构建错误

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add shadcn sidebar component and fuse.js"
```

---

### Task 4: 全局状态 Provider

**Files:**
- Create: `components/app-provider.tsx`

**Step 1: 创建 AppProvider 组件**

该 Provider 管理：当前视图模式、当前分类、搜索词、用户数据（收藏/历史/搜索引擎选择）。

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Category, ClickRecord, SearchEngine, ViewMode } from "@/lib/types";
import {
  addClickRecord,
  loadUserData,
  removeClickRecord,
  setSelectedEngine,
  setSidebarCollapsed,
  toggleFavorite,
} from "@/lib/storage";

interface AppState {
  viewMode: ViewMode;
  currentCategoryId: string | null;
  searchQuery: string;
  categories: Category[];
  engines: SearchEngine[];
  favorites: string[];
  clickHistory: ClickRecord[];
  selectedEngineId: string;
  sidebarCollapsed: boolean;
}

interface AppActions {
  setViewMode: (mode: ViewMode) => void;
  setCurrentCategoryId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  handleKeywordClick: (keyword: string, categoryId: string) => void;
  handleToggleFavorite: (keyword: string) => void;
  handleRemoveClickRecord: (keyword: string, categoryId: string) => void;
  handleSetEngine: (engineId: string) => void;
  handleSetSidebarCollapsed: (collapsed: boolean) => void;
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

export function AppProvider({ categories, engines, defaultEngineId, children }: AppProviderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [clickHistory, setClickHistory] = useState<ClickRecord[]>([]);
  const [selectedEngineId, setSelectedEngineIdState] = useState(defaultEngineId);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);

  useEffect(() => {
    const data = loadUserData();
    setFavorites(data.favorites);
    setClickHistory(data.clickHistory);
    setSelectedEngineIdState(data.selectedEngineId || defaultEngineId);
    setSidebarCollapsedState(data.sidebarCollapsed);
  }, [defaultEngineId]);

  const handleKeywordClick = useCallback((keyword: string, categoryId: string) => {
    const engine = engines.find((e) => e.id === selectedEngineId) || engines[0];
    const url = engine.urlTemplate.replace("{keyword}", encodeURIComponent(keyword));
    window.open(url, "_blank");
    const updated = addClickRecord(keyword, categoryId);
    setClickHistory([...updated]);
  }, [engines, selectedEngineId]);

  const handleToggleFavorite = useCallback((keyword: string) => {
    const updated = toggleFavorite(keyword);
    setFavorites([...updated]);
  }, []);

  const handleRemoveClickRecord = useCallback((keyword: string, categoryId: string) => {
    const updated = removeClickRecord(keyword, categoryId);
    setClickHistory([...updated]);
  }, []);

  const handleSetEngine = useCallback((engineId: string) => {
    setSelectedEngine(engineId);
    setSelectedEngineIdState(engineId);
  }, []);

  const handleSetSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    setSidebarCollapsedState(collapsed);
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
        sidebarCollapsed,
        setViewMode,
        setCurrentCategoryId,
        setSearchQuery,
        handleKeywordClick,
        handleToggleFavorite,
        handleRemoveClickRecord,
        handleSetEngine,
        handleSetSidebarCollapsed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
```

**Step 2: Commit**

```bash
git add components/app-provider.tsx
git commit -m "feat: add global AppProvider with state management"
```

---

### Task 5: 左侧抽屉组件

**Files:**
- Create: `components/app-sidebar.tsx`

**Step 1: 实现侧边栏**

使用 shadcn Sidebar 组件，包含：LOGO、首页、收藏导航项、分类列表。

```tsx
"use client";

import { Home, Star, FolderOpen } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useApp } from "@/components/app-provider";

export function AppSidebar() {
  const { categories, viewMode, currentCategoryId, setViewMode, setCurrentCategoryId } = useApp();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h1 className="text-xl font-bold">KeySpace</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={viewMode === "home"}
                  onClick={() => setViewMode("home")}
                >
                  <Home />
                  <span>首页</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={viewMode === "favorites"}
                  onClick={() => setViewMode("favorites")}
                >
                  <Star />
                  <span>收藏</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>分类</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((cat) => (
                <SidebarMenuItem key={cat.id}>
                  <SidebarMenuButton
                    isActive={viewMode === "category" && currentCategoryId === cat.id}
                    onClick={() => {
                      setCurrentCategoryId(cat.id);
                      setViewMode("category");
                    }}
                  >
                    <FolderOpen />
                    <span>{cat.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
```

**Step 2: Commit**

```bash
git add components/app-sidebar.tsx
git commit -m "feat: add AppSidebar component with navigation"
```

---

### Task 6: 搜索引擎选择器 + 搜索输入框

**Files:**
- Create: `components/search-engine-selector.tsx`
- Create: `components/search-input.tsx`

**Step 1: 搜索引擎选择器**

```tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/components/app-provider";

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
```

**Step 2: 搜索输入框**

```tsx
"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useApp } from "@/components/app-provider";

export function SearchInput() {
  const { searchQuery, setSearchQuery } = useApp();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="搜索关键词..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
```

**Step 3: 安装 shadcn Select 和 Input 组件**

Run: `npx shadcn@latest add select input`

**Step 4: Commit**

```bash
git add components/search-engine-selector.tsx components/search-input.tsx
git commit -m "feat: add search engine selector and search input"
```

---

### Task 7: 关键词标签组件与标签网格

**Files:**
- Create: `components/keyword-tag.tsx`
- Create: `components/keyword-grid.tsx`

**Step 1: 单个关键词标签**

```tsx
"use client";

import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/components/app-provider";

interface KeywordTagProps {
  keyword: string;
  categoryId: string;
}

export function KeywordTag({ keyword, categoryId }: KeywordTagProps) {
  const { favorites, handleToggleFavorite, handleKeywordClick } = useApp();
  const isFav = favorites.includes(keyword);

  return (
    <Badge
      variant="outline"
      className="cursor-pointer gap-1 px-3 py-1.5 text-sm hover:bg-accent transition-colors select-none"
    >
      <span onClick={() => handleKeywordClick(keyword, categoryId)}>{keyword}</span>
      <Star
        className={`h-3 w-3 shrink-0 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
        onClick={(e) => {
          e.stopPropagation();
          handleToggleFavorite(keyword);
        }}
      />
    </Badge>
  );
}
```

**Step 2: 关键词标签网格**

```tsx
"use client";

import Fuse from "fuse.js";
import { useMemo } from "react";
import { KeywordTag } from "@/components/keyword-tag";
import { useApp } from "@/components/app-provider";

interface KeywordGridProps {
  keywords: string[];
  categoryId: string;
}

export function KeywordGrid({ keywords, categoryId }: KeywordGridProps) {
  const { searchQuery } = useApp();

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return keywords;
    const fuse = new Fuse(keywords, { threshold: 0.3 });
    return fuse.search(searchQuery).map((r) => r.item);
  }, [keywords, searchQuery]);

  if (filtered.length === 0) {
    return <p className="text-muted-foreground py-8 text-center">没有匹配的关键词</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {filtered.map((kw) => (
        <KeywordTag key={kw} keyword={kw} categoryId={categoryId} />
      ))}
    </div>
  );
}
```

**Step 3: 安装 shadcn Badge 组件**

Run: `npx shadcn@latest add badge`

**Step 4: Commit**

```bash
git add components/keyword-tag.tsx components/keyword-grid.tsx
git commit -m "feat: add keyword tag and grid components with fuse.js search"
```

---

### Task 8: 首页视图与收藏视图

**Files:**
- Create: `components/home-view.tsx`
- Create: `components/favorites-view.tsx`

**Step 1: 首页视图（热门 + 最近）**

```tsx
"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeywordTag } from "@/components/keyword-tag";
import { useApp } from "@/components/app-provider";

export function HomeView() {
  const { clickHistory, handleRemoveClickRecord } = useApp();
  const [sortMode, setSortMode] = useState<"count" | "recent">("count");

  const topKeywords = useMemo(() => {
    const sorted = [...clickHistory].sort((a, b) =>
      sortMode === "count" ? b.clickCount - a.clickCount : b.clickedAt - a.clickedAt
    );
    return sorted.slice(0, 30);
  }, [clickHistory, sortMode]);

  const recentKeywords = useMemo(() => {
    return [...clickHistory]
      .sort((a, b) => b.clickedAt - a.clickedAt)
      .slice(0, 10);
  }, [clickHistory]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {sortMode === "count" ? "热门关键词" : "最近点击"}
          </h2>
          <div className="flex gap-2">
            <Button
              variant={sortMode === "count" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortMode("count")}
            >
              按点击数
            </Button>
            <Button
              variant={sortMode === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortMode("recent")}
            >
              按最新
            </Button>
          </div>
        </div>
        {topKeywords.length === 0 ? (
          <p className="text-muted-foreground">暂无点击记录，点击关键词开始使用</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topKeywords.map((r) => (
              <div key={`${r.keyword}-${r.categoryId}`} className="group relative">
                <KeywordTag keyword={r.keyword} categoryId={r.categoryId} />
                <button
                  className="absolute -right-1 -top-1 hidden group-hover:block rounded-full bg-destructive text-destructive-foreground p-0.5"
                  onClick={() => handleRemoveClickRecord(r.keyword, r.categoryId)}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <span className="ml-1 text-xs text-muted-foreground">{r.clickCount}次</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: 收藏视图**

```tsx
"use client";

import { useMemo } from "react";
import Fuse from "fuse.js";
import { KeywordTag } from "@/components/keyword-tag";
import { SearchInput } from "@/components/search-input";
import { useApp } from "@/components/app-provider";

export function FavoritesView() {
  const { favorites, categories, searchQuery } = useApp();

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    const fuse = new Fuse(favorites, { threshold: 0.3 });
    return fuse.search(searchQuery).map((r) => r.item);
  }, [favorites, searchQuery]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">收藏关键词</h2>
      {filtered.length === 0 ? (
        <p className="text-muted-foreground">
          {favorites.length === 0 ? "暂无收藏，点击关键词旁的星标添加" : "没有匹配的收藏"}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filtered.map((kw) => {
            const cat = categories[0];
            return <KeywordTag key={kw} keyword={kw} categoryId={cat?.id ?? ""} />;
          })}
        </div>
      )}
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add components/home-view.tsx components/favorites-view.tsx
git commit -m "feat: add home view and favorites view"
```

---

### Task 9: 主页面整合与 RSC 数据加载

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

**Step 1: 更新 layout.tsx**

RSC 层加载所有静态数据，传入 AppProvider。

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import categoriesData from "@/data/categories.json";
import enginesData from "@/data/engines.json";
import configData from "@/data/config.json";
import { AppProvider } from "@/components/app-provider";
import type { Category, SearchEngine } from "@/lib/types";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: configData.siteName,
  description: "关键词导航工具",
};

const categories = categoriesData as Category[];
const engines = enginesData as SearchEngine[];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={cn("h-full antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <AppProvider
          categories={categories}
          engines={engines}
          defaultEngineId={configData.defaultEngineId}
        >
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
```

**Step 2: 更新 page.tsx**

整合 Sidebar + 内容区，RSC 加载关键词数据。

```tsx
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MainContent } from "@/components/main-content";

export default async function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <MainContent />
      </SidebarInset>
    </SidebarProvider>
  );
}
```

**Step 3: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: integrate layout with RSC data loading and sidebar"
```

---

### Task 10: MainContent 组件

**Files:**
- Create: `components/main-content.tsx`

**Step 1: 主内容区组件**

根据当前视图模式渲染不同内容，RSC 加载关键词数据后传给客户端组件。

```tsx
"use client";

import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SearchEngineSelector } from "@/components/search-engine-selector";
import { SearchInput } from "@/components/search-input";
import { KeywordGrid } from "@/components/keyword-grid";
import { HomeView } from "@/components/home-view";
import { FavoritesView } from "@/components/favorites-view";
import { useApp } from "@/components/app-provider";
import type { KeywordsFile } from "@/lib/types";

export function MainContent() {
  const { viewMode, currentCategoryId, categories, searchQuery, setSearchQuery } = useApp();
  const [keywordsData, setKeywordsData] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function loadKeywords() {
      const data: Record<string, string[]> = {};
      for (const cat of categories) {
        try {
          const mod = await import(`@/data/keywords/${cat.id}.json`);
          data[cat.id] = (mod.default as KeywordsFile).keywords;
        } catch {
          data[cat.id] = [];
        }
      }
      setKeywordsData(data);
    }
    loadKeywords();
  }, [categories]);

  const currentCategory = categories.find((c) => c.id === currentCategoryId);
  const currentKeywords = currentCategoryId ? keywordsData[currentCategoryId] ?? [] : [];

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-14 items-center gap-4 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <SearchInput />
        <SearchEngineSelector />
      </header>
      <main className="flex-1 overflow-auto p-6">
        {viewMode === "home" && <HomeView />}
        {viewMode === "favorites" && <FavoritesView />}
        {viewMode === "category" && currentCategory && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{currentCategory.name}</h2>
            <KeywordGrid keywords={currentKeywords} categoryId={currentCategory.id} />
          </div>
        )}
      </main>
    </div>
  );
}
```

**Step 2: 安装 Separator 组件**

Run: `npx shadcn@latest add separator`

**Step 3: Commit**

```bash
git add components/main-content.tsx
git commit -m "feat: add main content area with view switching"
```

---

### Task 11: 整体验证与调试

**Step 1: 运行 dev server**

Run: `pnpm dev`

**Step 2: 验证功能**

- 侧边栏可折叠/展开
- 点击分类切换到对应关键词列表
- 搜索框实时过滤关键词
- 点击关键词打开搜索引擎
- 收藏功能正常
- 首页显示热门/最近关键词
- 搜索引擎切换器正常工作

**Step 3: 运行 lint 和 build**

Run: `pnpm lint && pnpm build`

**Step 4: 修复所有 lint/构建错误**

**Step 5: Commit 修复**

```bash
git add -A
git commit -m "fix: resolve lint and build errors"
```
