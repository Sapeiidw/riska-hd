"use client";

import { BookOpen, Settings, User } from "lucide-react";
import * as React from "react";

import { NavMain, NavItem, NavSubItem, NavChildOPD } from "@/components/nav-main";
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
import { useOpdList } from "@/lib/opd";
import { OpdConfig } from "@/lib/opd/types";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { NavSetting } from "./nav-setting";

const settingData = [
  {
    name: "User",
    url: "/user",
    icon: User,
  },
  {
    name: "Kelola OPD",
    url: "/admin/opd",
    icon: Settings,
  },
];

function generateOpdNavItems(slug: string): NavSubItem[] {
  return [
    { title: "Dashboard", url: `/${slug}` },
    { title: "Kenaikan Pangkat", url: `/${slug}/kenaikan-pangkat` },
    { title: "Status Dokumen Wajib", url: `/${slug}/status-dokumen-wajib` },
    { title: "Golongan Pegawai", url: `/${slug}/golongan-pegawai` },
    { title: "Status SK Kenpa", url: `/${slug}/status-sk-kenaikan-pangkat` },
    { title: "Status Kenaikan Pangkat", url: `/${slug}/status-kenaikan-pangkat` },
    { title: "Status Pegawai", url: `/${slug}/status-pegawai` },
  ];
}

function buildOpdTree(
  opdList: OpdConfig[],
  pathname: string
): NavItem[] {
  // Get parent OPDs (parent_id is null)
  const parentOpds = opdList.filter((opd) => opd.parent_id === null);

  // Group children by parent_id
  const childrenMap = new Map<number, OpdConfig[]>();
  opdList.forEach((opd) => {
    if (opd.parent_id !== null) {
      const existing = childrenMap.get(opd.parent_id) || [];
      existing.push(opd);
      childrenMap.set(opd.parent_id, existing);
    }
  });

  return parentOpds.map((parent) => {
    // Generate parent's sub-menu items
    const parentItems = generateOpdNavItems(parent.slug);
    const updatedParentItems = parentItems.map((item) => ({
      ...item,
      isActive: pathname === item.url || undefined,
    }));

    // Get children for this parent
    const children = childrenMap.get(parent.id) || [];

    // Generate children nav items
    const childrenNav: NavChildOPD[] = children.map((child) => {
      const childItems = generateOpdNavItems(child.slug);
      const updatedChildItems = childItems.map((item) => ({
        ...item,
        isActive: pathname === item.url || undefined,
      }));

      const isChildActive =
        updatedChildItems.some((i) => i.isActive) ||
        pathname.startsWith(`/${child.slug}`);

      return {
        title: child.singkatan,
        slug: child.slug,
        isActive: isChildActive || undefined,
        items: updatedChildItems,
      };
    });

    // Check if parent section is active
    const isParentActive =
      updatedParentItems.some((i) => i.isActive) ||
      pathname.startsWith(`/${parent.slug}`) ||
      childrenNav.some((c) => c.isActive);

    return {
      title: parent.singkatan,
      url: "#",
      icon: BookOpen,
      items: updatedParentItems,
      children: childrenNav.length > 0 ? childrenNav : undefined,
      isActive: isParentActive || undefined,
    };
  });
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: opdList } = useOpdList();

  const navWithActive = React.useMemo(() => {
    if (!opdList) return [];
    return buildOpdTree(opdList, pathname);
  }, [pathname, opdList]);

  const { state } = useSidebar();

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
                SK
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">SIKEPAT</span>
                <span className="truncate text-xs text-gray-500">Monitoring Kenaikan Pangkat</span>
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
        <UserButton
          showName={state === "expanded"}
          appearance={{
            elements: {
              rootBox: "!w-full",
              userButtonTrigger: "!w-full",
              userButtonBox: cn(
                state === "expanded"
                  ? "py-2 px-4 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100"
                  : "p-0 bg-transparent",
                "!w-full flex !justify-between items-center rounded-xl text-gray-700 transition-colors border border-purple-100"
              ),
            },
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
