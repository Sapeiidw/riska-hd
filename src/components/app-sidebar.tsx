"use client";

import {
  Home,
  Settings,
  User,
  Database,
  Users,
  Stethoscope,
  Heart,
  Building2,
  MonitorCog,
  Clock,
  FileText,
  Pill,
  Activity,
  AlertCircle,
  Shield,
  ScrollText,
  CalendarDays,
  Newspaper,
  Droplets,
  FlaskConical,
  UserCircle,
} from "lucide-react";
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
import { LogOut, UserCog } from "lucide-react";
import Link from "next/link";

const settingData = [
  {
    name: "Users",
    url: "/settings/users",
    icon: Users,
  },
  {
    name: "Roles",
    url: "/settings/roles",
    icon: Shield,
  },
  {
    name: "Audit Log",
    url: "/settings/audit-log",
    icon: ScrollText,
  },
];

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    items: [{ title: "Overview", url: "/dashboard" }],
  },
  {
    title: "Sesi HD",
    url: "/hd-sessions",
    icon: Droplets,
    items: [
      { title: "Sesi Hari Ini", url: "/hd-sessions" },
      { title: "Hasil Lab", url: "/patient-labs" },
    ],
  },
  {
    title: "Portal Pasien",
    url: "/portal",
    icon: UserCircle,
    items: [
      { title: "Dashboard", url: "/portal" },
      { title: "Riwayat Sesi", url: "/portal/sessions" },
      { title: "Hasil Lab", url: "/portal/labs" },
    ],
  },
  {
    title: "Ruang Informasi",
    url: "/master/ruang-informasi",
    icon: Newspaper,
    items: [{ title: "Kelola Konten", url: "/master/ruang-informasi" }],
  },
  {
    title: "Penjadwalan",
    url: "/schedules",
    icon: CalendarDays,
    items: [
      { title: "Jadwal Perawat", url: "/schedules/nurses" },
      { title: "Jadwal Pasien", url: "/schedules/patients" },
    ],
  },
  {
    title: "Master Data",
    url: "/master",
    icon: Database,
    items: [
      { title: "Pasien", url: "/master/patients" },
      { title: "Dokter", url: "/master/doctors" },
      { title: "Perawat", url: "/master/nurses" },
      { title: "Mesin HD", url: "/master/machines" },
      { title: "Ruangan", url: "/master/rooms" },
      { title: "Shift", url: "/master/shifts" },
      { title: "Protokol HD", url: "/master/protocols" },
      { title: "Diagnosa", url: "/master/diagnoses" },
      { title: "Obat", url: "/master/medications" },
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
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sky-50"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-sky-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-sky-500/30">
                RH
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500 bg-clip-text text-transparent">
                  RISKA HD
                </span>
                <span className="text-[10px] text-gray-500 leading-tight">
                  <span className="font-semibold text-sky-600">R</span>uang{" "}
                  <span className="font-semibold text-sky-600">I</span>nformasi &{" "}
                  <span className="font-semibold text-sky-600">S</span>istem{" "}
                  <span className="font-semibold text-sky-600">K</span>elola{" "}
                  <span className="font-semibold text-sky-600">A</span>ktivitas{" "}
                  <span className="font-semibold text-sky-600">H</span>emo
                  <span className="font-semibold text-sky-600">d</span>ialisa
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
                    ? "py-2 px-4 bg-gradient-to-r from-sky-50 to-cyan-50 hover:from-sky-100 hover:to-cyan-100 border border-sky-100"
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
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <UserCog className="mr-2 h-4 w-4" />
                  Profil Saya
                </Link>
              </DropdownMenuItem>
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
