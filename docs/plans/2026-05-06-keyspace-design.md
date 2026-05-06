# KeySpace 关键词导航工具 — 设计文档

## 方案选择

**方案 C：RSC 加载静态数据 + 客户端管理用户数据**

- 分类/关键词/搜索引擎等静态数据通过 Next.js RSC 加载
- 点击历史、收藏等用户数据用 localStorage
- 搜索引擎配置作为静态数据

## 整体布局

类 DeepSeek Chat 经典双栏布局：

```
┌──────────────────────────────────────────────┐
│ [☰] KeySpace                    [搜索引擎▼] │
├─────────┬────────────────────────────────────┤
│ LOGO    │  分类名称                          │
│ ──────  │  ┌──────┐ ┌──────┐ ┌──────┐       │
│ 首页    │  │ SEO  │ │ SEM  │ │ CTR  │       │
│ 收藏    │  └──────┘ └──────┘ └──────┘       │
│ ──────  │  ┌──────┐ ┌──────┐ ┌──────┐       │
│ 分类 A  │  │ 关键词│ │ 关键词│ │ 关键词│       │
│ 分类 B  │  └──────┘ └──────┘ └──────┘       │
│ 分类 C  │  ...更多关键词标签                   │
│         │                                    │
└─────────┴────────────────────────────────────┘
```

- **左侧抽屉**：可收起/展开，含 LOGO、首页、收藏、分类列表
- **右侧内容区**：顶部搜索栏 + 当前分类名称 + 关键词标签云网格

## 数据结构设计

### 静态数据（JSON 文件）

**`data/categories.json`** — 仅分类元信息

```ts
interface Category {
  id: string;        // slug，如 "seo"
  name: string;      // 显示名，如 "SEO优化"
  icon?: string;
}
```

**`data/keywords/{slug}.json`** — 每个分类的关键词独立文件

```ts
interface KeywordsFile {
  categoryId: string;
  keywords: string[];
}
```

**`data/engines.json`** — 搜索引擎配置

```ts
interface SearchEngine {
  id: string;
  name: string;
  icon?: string;
  urlTemplate: string; // e.g. "https://www.google.com/search?q={keyword}"
}
```

**`data/config.json`** — 项目配置

```ts
interface ProjectConfig {
  siteName: string;
  defaultEngineId: string;
}
```

### 用户数据（localStorage）

```ts
interface UserStorage {
  favorites: string[];
  clickHistory: ClickRecord[];
  selectedEngineId: string;
  sidebarCollapsed: boolean;
}

interface ClickRecord {
  keyword: string;
  categoryId: string;
  clickedAt: number;
  clickCount: number;
}
```

## 页面与视图

| 视图 | 触发 | 右侧内容 |
|------|------|----------|
| 首页 | 点击"首页" | 热门关键词（按点击数排序）+ 最近点击的关键词 |
| 收藏 | 点击"收藏" | 收藏的关键词列表 |
| 分类 | 点击某分类 | 该分类名称 + 关键词标签云/网格 |
| 搜索 | 输入搜索词 | 当前分类下匹配的关键词（fuse.js） |

## 核心交互

- **点击关键词** → 用当前选中的搜索引擎打开搜索页（window.open）
- **搜索引擎切换** → 顶部下拉选择器，切换后影响后续点击行为
- **收藏关键词** → 关键词标签上点击星标图标添加/移除收藏
- **搜索** → 输入框实时过滤当前分类下的关键词，使用 fuse.js 模糊匹配，各分类关键词独立
- **点击历史管理** → 提供入口查看，支持按点击数/最新时间排序，支持删除

## 技术选型

| 技术 | 用途 |
|------|------|
| Next.js 16 RSC | 服务端加载静态 JSON 数据 |
| shadcn/ui | Sidebar、Button、Input、DropdownMenu 等组件 |
| Tailwind CSS v4 | 样式 |
| fuse.js | 关键词模糊搜索 |
| localStorage | 用户数据持久化 |

## 文件结构

```
app/
  layout.tsx          — 根布局（RSC，加载静态数据传入 Provider）
  page.tsx            — 主页面

components/
  app-sidebar.tsx     — 左侧抽屉（shadcn Sidebar）
  keyword-grid.tsx    — 关键词标签云/网格
  keyword-tag.tsx     — 单个关键词标签（含收藏按钮）
  search-engine-selector.tsx — 搜索引擎切换器
  search-input.tsx    — 搜索输入框
  home-view.tsx       — 首页视图（热门+最近）
  favorites-view.tsx  — 收藏视图

data/
  categories.json     — 分类元信息
  keywords/
    seo.json          — SEO 分类关键词
    sem.json          — SEM 分类关键词
    content-marketing.json — 内容营销关键词
    ...
  engines.json        — 搜索引擎配置
  config.json         — 项目配置

lib/
  utils.ts            — 工具函数
  storage.ts          — localStorage 读写
  types.ts            — TypeScript 类型定义
```
