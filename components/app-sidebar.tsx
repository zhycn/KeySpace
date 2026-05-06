"use client";

import { FolderOpen, Home, Star } from "lucide-react";
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
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={viewMode === "favorites"}
                  onClick={() => {
                    setViewMode("favorites");
                    setSearchQuery("");
                  }}
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
                    isActive={
                      viewMode === "category" && currentCategoryId === cat.id
                    }
                    onClick={() => {
                      setCurrentCategoryId(cat.id);
                      setViewMode("category");
                      setSearchQuery("");
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
