"use client";

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  User,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
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
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { NavSetting } from "./nav-setting";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Bapenda",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/bapenda" },
        { title: "Kenaikan Pangkat", url: "/bapenda/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/bapenda/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/bapenda/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/bapenda/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/bapenda/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/bapenda/status-pegawai" },
      ],
    },
    {
      title: "Kesbangpol",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/kesbangpol" },
        { title: "Kenaikan Pangkat", url: "/kesbangpol/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/kesbangpol/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/kesbangpol/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/kesbangpol/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/kesbangpol/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/kesbangpol/status-pegawai" },
      ],
    },
    {
      title: "Bappeda",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/bappeda" },
        { title: "Kenaikan Pangkat", url: "/bappeda/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/bappeda/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/bappeda/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/bappeda/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/bappeda/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/bappeda/status-pegawai" },
      ],
    },
    {
      title: "BPBD",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/bpbd" },
        { title: "Kenaikan Pangkat", url: "/bpbd/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/bpbd/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/bpbd/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/bpbd/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/bpbd/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/bpbd/status-pegawai" },
      ],
    },
    {
      title: "Disdukcapil",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/disdukcapil" },
        { title: "Kenaikan Pangkat", url: "/disdukcapil/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/disdukcapil/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/disdukcapil/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/disdukcapil/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/disdukcapil/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/disdukcapil/status-pegawai" },
      ],
    },
    {
      title: "Disdik",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/disdik" },
        { title: "Kenaikan Pangkat", url: "/disdik/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/disdik/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/disdik/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/disdik/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/disdik/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/disdik/status-pegawai" },
      ],
    },
    {
      title: "Dinkes",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/dinkes" },
        { title: "Kenaikan Pangkat", url: "/dinkes/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/dinkes/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/dinkes/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/dinkes/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/dinkes/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/dinkes/status-pegawai" },
      ],
    },
    {
      title: "DKPP",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/dkpp" },
        { title: "Kenaikan Pangkat", url: "/dkpp/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/dkpp/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/dkpp/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/dkpp/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/dkpp/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/dkpp/status-pegawai" },
      ],
    },
    {
      title: "Disnaker",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/disnaker" },
        { title: "Kenaikan Pangkat", url: "/disnaker/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/disnaker/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/disnaker/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/disnaker/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/disnaker/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/disnaker/status-pegawai" },
      ],
    },
    {
      title: "Diskominfo",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/diskominfo" },
        { title: "Kenaikan Pangkat", url: "/diskominfo/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/diskominfo/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/diskominfo/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/diskominfo/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/diskominfo/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/diskominfo/status-pegawai" },
      ],
    },
    {
      title: "Diskoperin",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/diskoperin" },
        { title: "Kenaikan Pangkat", url: "/diskoperin/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/diskoperin/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/diskoperin/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/diskoperin/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/diskoperin/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/diskoperin/status-pegawai" },
      ],
    },
    {
      title: "DLH",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/dlh" },
        { title: "Kenaikan Pangkat", url: "/dlh/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/dlh/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/dlh/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/dlh/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/dlh/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/dlh/status-pegawai" },
      ],
    },
    {
      title: "DPUPR",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/dpupr" },
        { title: "Kenaikan Pangkat", url: "/dpupr/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/dpupr/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/dpupr/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/dpupr/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/dpupr/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/dpupr/status-pegawai" },
      ],
    },
    {
      title: "Damkar",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/damkar" },
        { title: "Kenaikan Pangkat", url: "/damkar/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/damkar/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/damkar/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/damkar/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/damkar/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/damkar/status-pegawai" },
      ],
    },
    {
      title: "DP3AKB",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/dp3akb" },
        { title: "Kenaikan Pangkat", url: "/dp3akb/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/dp3akb/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/dp3akb/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/dp3akb/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/dp3akb/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/dp3akb/status-pegawai" },
      ],
    },
    {
      title: "Disporapar",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/disporapar" },
        { title: "Kenaikan Pangkat", url: "/disporapar/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/disporapar/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/disporapar/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/disporapar/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/disporapar/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/disporapar/status-pegawai" },
      ],
    },
    {
      title: "DPMPTSP",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/dpmptsp" },
        { title: "Kenaikan Pangkat", url: "/dpmptsp/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/dpmptsp/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/dpmptsp/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/dpmptsp/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/dpmptsp/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/dpmptsp/status-pegawai" },
      ],
    },
    {
      title: "RSUD",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Dashboard", url: "/rsud" },
        { title: "Kenaikan Pangkat", url: "/rsud/kenaikan-pangkat" },
        { title: "Status Dokumen Wajib", url: "/rsud/status-dokumen-wajib" },
        { title: "Golongan Pegawai", url: "/rsud/golongan-pegawai" },
        { title: "Status SK Kenpa", url: "/rsud/status-sk-kenaikan-pangkat" },
        { title: "Status Kenaikan Pangkat", url: "/rsud/status-kenaikan-pangkat" },
        { title: "Status Pegawai", url: "/rsud/status-pegawai" },
      ],
    },
  ],
  setting: [
    {
      name: "User",
      url: "/user",
      icon: User,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  // 🧠 Compute active state dynamically
  const navWithActive = React.useMemo(() => {
    return data.navMain.map((section) => {
      const updatedItems = section.items.map((item) => ({
        ...item,
        isActive: pathname === item.url,
      }));

      // Section is active if any sub-item is active OR pathname starts with the section's base path
      const sectionBasePath = section.items[0]?.url.split("/")[1] || "";
      const isSectionActive =
        updatedItems.some((i) => i.isActive) ||
        (sectionBasePath && pathname.startsWith(`/${sectionBasePath}`));

      return {
        ...section,
        items: updatedItems,
        isActive: isSectionActive,
      };
    });
  }, [pathname]);

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
        <NavSetting data={data.setting} />
      </SidebarContent>
      <SidebarFooter>
        {/* <SidebarMenu>
          <SidebarMenuItem> */}
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

        {/* <NavUser user={data.user} /> */}
        {/* </SidebarMenuItem> */}
        {/* </SidebarMenu> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
