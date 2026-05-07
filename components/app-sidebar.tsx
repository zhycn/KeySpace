"use client";

import {
  Award,
  BarChart3,
  FileText,
  FolderOpen,
  Home,
  MousePointerClick,
  Search,
  Share2,
  ShoppingCart,
  Video,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  MousePointerClick,
  FileText,
  Share2,
  ShoppingCart,
  BarChart3,
  Award,
  Video,
};

export function AppSidebar() {
  const {
    categories,
    viewMode,
    currentCategoryId,
    setViewMode,
    setCurrentCategoryId,
    setSearchQuery,
  } = useApp();

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
                  onClick={() => {
                    setViewMode("home");
                    setSearchQuery("");
                  }}
                >
                  <Home />
                  <span>首页</span>
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
                const Icon = cat.icon && iconMap[cat.icon] ? iconMap[cat.icon] : FolderOpen;
                return (
                  <SidebarMenuItem key={cat.id}>
                    <SidebarMenuButton
                      isActive={
                        viewMode === "category" && currentCategoryId === cat.id
                      }
                      onClick={() => {
                        setCurrentCategoryId(cat.id);
                        setViewMode("category");
                        setSearchQuery("");
                      }}
                    >
                      <Icon />
                      <span>{cat.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
