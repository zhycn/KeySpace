"use client";

import { History, Home, Keyboard, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useNavigation } from "@/components/navigation-provider";
import { useSearch } from "@/components/search-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getIcon } from "@/lib/icon-map";

export function AppSidebar() {
  const { setSearchQuery } = useSearch();
  const { setCurrentCategoryId } = useNavigation();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const categories = useSearch().categories;
  const isHome =
    pathname === "/" ||
    pathname.endsWith("/home") ||
    pathname.match(/^\/[a-z]{2}$/) !== null ||
    pathname.match(/^\/[a-z]{2}\/$/) !== null;
  const isHistory = pathname.endsWith("/history");
  const currentCategoryId =
    pathname.split("/").filter(Boolean).length >= 2 && !isHistory
      ? (pathname.split("/").filter(Boolean).pop() ?? null)
      : null;

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="text-xl font-bold">KeySpace</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isHome}>
                  <Link href="/" onClick={() => setSearchQuery("")}>
                    <Home />
                    <span>首页</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isHistory}>
                  <Link href="/history" onClick={() => setSearchQuery("")}>
                    <History />
                    <span>历史记录</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>分类</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((cat) => {
                const Icon = getIcon(cat.icon);
                const isActive = currentCategoryId === cat.id;
                return (
                  <SidebarMenuItem key={cat.id}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={`/${cat.id}`}
                        onClick={() => {
                          setCurrentCategoryId(cat.id);
                          setSearchQuery("");
                        }}
                      >
                        <Icon />
                        <span>{cat.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="hidden dark:block" />
              <Moon className="block dark:hidden" />
              <span className="dark:hidden">深色主题</span>
              <span className="hidden dark:inline">浅色主题</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Popover>
              <PopoverTrigger asChild>
                <SidebarMenuButton>
                  <Keyboard />
                  <span>快捷键</span>
                </SidebarMenuButton>
              </PopoverTrigger>
              <PopoverContent
                side="right"
                align="end"
                className="w-56 p-3 gap-2"
              >
                <div className="text-sm font-medium mb-1">键盘快捷键</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">聚焦搜索</span>
                  <kbd className="pointer-events-none inline-flex h-5.5 min-w-5.5 items-center justify-center rounded-lg bg-muted px-1.5 font-sans text-xs font-medium text-muted-foreground">
                    ⌘K
                  </kbd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">清除搜索</span>
                  <kbd className="pointer-events-none inline-flex h-5.5 min-w-5.5 items-center justify-center rounded-lg bg-muted px-1.5 font-sans text-xs font-medium text-muted-foreground">
                    Esc
                  </kbd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">切换侧边栏</span>
                  <kbd className="pointer-events-none inline-flex h-5.5 min-w-5.5 items-center justify-center rounded-lg bg-muted px-1.5 font-sans text-xs font-medium text-muted-foreground">
                    ⌘B
                  </kbd>
                </div>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
