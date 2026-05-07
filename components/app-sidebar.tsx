"use client";

import { Home } from "lucide-react";
import { useNavigation } from "@/components/navigation-provider";
import { useSearch } from "@/components/search-provider";
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
import { getIcon } from "@/lib/icon-map";

export function AppSidebar() {
  const { categories, setSearchQuery } = useSearch();
  const { viewMode, currentCategoryId, setViewMode, setCurrentCategoryId } =
    useNavigation();

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
                const Icon = getIcon(cat.icon);
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
