"use client";

import { History, Home, Keyboard, Languages, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useNavigation } from "@/components/navigation-provider";
import { useSearch } from "@/components/search-provider";
import { useTheme } from "@/components/theme-provider";
import { Kbd } from "@/components/ui/kbd";
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
import { useLocaleSwitch } from "@/i18n/locale-provider";
import { getIcon } from "@/lib/icon-map";

export function AppSidebar() {
  const { setSearchQuery, categories } = useSearch();
  const { setCurrentCategoryId } = useNavigation();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocaleSwitch();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tSidebar = useTranslations("sidebar");
  const pathSegments = pathname.split("/").filter(Boolean);
  const isHome = pathSegments.length === 0;
  const isHistory = pathSegments[0] === "history";
  const currentCategoryId =
    !isHome && !isHistory ? (pathSegments[0] ?? null) : null;

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
                    <span>{t("home")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isHistory}>
                  <Link href="/history" onClick={() => setSearchQuery("")}>
                    <History />
                    <span>{t("history")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t("categories")}</SidebarGroupLabel>
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
              <span className="dark:hidden">{tSidebar("darkTheme")}</span>
              <span className="hidden dark:inline">
                {tSidebar("lightTheme")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            >
              <Languages />
              <span>
                {locale === "zh"
                  ? tSidebar("switchToEn")
                  : tSidebar("switchToZh")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Popover>
              <PopoverTrigger asChild>
                <SidebarMenuButton>
                  <Keyboard />
                  <span>{tSidebar("shortcuts")}</span>
                </SidebarMenuButton>
              </PopoverTrigger>
              <PopoverContent
                side="right"
                align="end"
                className="w-56 p-3 gap-2"
              >
                <div className="text-sm font-medium mb-1">
                  {tSidebar("shortcutTitle")}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {tSidebar("shortcutFocusSearch")}
                  </span>
                  <Kbd>⌘K</Kbd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {tSidebar("shortcutClearSearch")}
                  </span>
                  <Kbd>Esc</Kbd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {tSidebar("shortcutToggleSidebar")}
                  </span>
                  <Kbd>⌘B</Kbd>
                </div>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
