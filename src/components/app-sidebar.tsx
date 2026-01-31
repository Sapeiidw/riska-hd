"use client";

import { Home, Settings, User } from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { NavSetting } from "./nav-setting";
import { useSession, signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

const settingData = [
  {
    name: "User",
    url: "/user",
    icon: User,
  },
  {
    name: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    items: [
      { title: "Overview", url: "/dashboard" },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { data: session } = useSession();

  const navWithActive = React.useMemo(() => {
    return navItems.map((item) => ({
      ...item,
      isActive: pathname.startsWith(item.url),
      items: item.items?.map((subItem) => ({
        ...subItem,
        isActive: pathname === subItem.url,
      })),
    }));
  }, [pathname]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-purple-50"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30">
                SA
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Starter App
                </span>
                <span className="truncate text-xs text-gray-500">
                  Next.js + Better Auth
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navWithActive} />
        <NavSetting data={settingData} />
      </SidebarContent>
      <SidebarFooter>
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-3 w-full rounded-xl transition-colors",
                  state === "expanded"
                    ? "py-2 px-4 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border border-purple-100"
                    : "p-2 justify-center"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || ""} />
                  <AvatarFallback>
                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {state === "expanded" && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user.email}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
