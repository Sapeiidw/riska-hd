"use client";

import {
  Home,
  Database,
  Users,
  Shield,
  ScrollText,
  CalendarDays,
  Newspaper,
  Droplets,
  UserCircle,
  BookOpen,
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
import { PERMISSIONS } from "@/lib/permissions/constants";
import { hasAnyPermission } from "@/lib/permissions/check";
import { ROLE_NAMES } from "@/lib/permissions/roles";

interface NavSubItem {
  title: string;
  url: string;
  permission?: string;
}

interface NavItemConfig {
  title: string;
  url: string;
  icon: typeof Home;
  permission?: string;
  roles?: string[];
  excludeRoles?: string[];
  items?: NavSubItem[];
}

interface SettingItemConfig {
  name: string;
  url: string;
  icon: typeof Users;
  permission?: string;
  excludeRoles?: string[];
}

const settingData: SettingItemConfig[] = [
  {
    name: "Users",
    url: "/settings/users",
    icon: Users,
    permission: PERMISSIONS.USER_READ,
    excludeRoles: [ROLE_NAMES.PASIEN],
  },
  {
    name: "Roles",
    url: "/settings/roles",
    icon: Shield,
    permission: PERMISSIONS.ROLE_READ,
    excludeRoles: [ROLE_NAMES.PASIEN],
  },
  {
    name: "Audit Log",
    url: "/settings/audit-log",
    icon: ScrollText,
    permission: PERMISSIONS.AUDIT_LOG_READ,
    excludeRoles: [ROLE_NAMES.PASIEN],
  },
];

const navItems: NavItemConfig[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    excludeRoles: [ROLE_NAMES.PASIEN],
    items: [{ title: "Overview", url: "/dashboard" }],
  },
  {
    title: "Sesi HD",
    url: "/hd-sessions",
    icon: Droplets,
    permission: PERMISSIONS.HD_SESSION_READ,
    excludeRoles: [ROLE_NAMES.PASIEN],
    items: [
      { title: "Sesi Hari Ini", url: "/hd-sessions", permission: PERMISSIONS.HD_SESSION_READ },
      { title: "Hasil Lab", url: "/patient-labs", permission: PERMISSIONS.PATIENT_LAB_READ },
    ],
  },
  {
    title: "Portal Pasien",
    url: "/portal",
    icon: UserCircle,
    roles: [ROLE_NAMES.PASIEN],
    items: [
      { title: "Dashboard", url: "/portal" },
      { title: "Riwayat Sesi", url: "/portal/sessions" },
      { title: "Hasil Lab", url: "/portal/labs" },
    ],
  },
  {
    title: "Artikel & Edukasi",
    url: "/informasi",
    icon: BookOpen,
    roles: [ROLE_NAMES.PASIEN],
    items: [
      { title: "Semua Artikel", url: "/informasi" },
    ],
  },
  {
    title: "Ruang Informasi",
    url: "/master/ruang-informasi",
    icon: Newspaper,
    permission: PERMISSIONS.RUANG_INFORMASI_READ,
    excludeRoles: [ROLE_NAMES.PASIEN],
    items: [{ title: "Kelola Konten", url: "/master/ruang-informasi" }],
  },
  {
    title: "Penjadwalan",
    url: "/schedules",
    icon: CalendarDays,
    permission: PERMISSIONS.NURSE_SCHEDULE_READ,
    excludeRoles: [ROLE_NAMES.PASIEN],
    items: [
      { title: "Jadwal Perawat", url: "/schedules/nurses", permission: PERMISSIONS.NURSE_SCHEDULE_READ },
      { title: "Jadwal Pasien", url: "/schedules/patients", permission: PERMISSIONS.PATIENT_SCHEDULE_READ },
    ],
  },
  {
    title: "Master Data",
    url: "/master",
    icon: Database,
    permission: PERMISSIONS.PATIENT_READ,
    excludeRoles: [ROLE_NAMES.PASIEN],
    items: [
      { title: "Pasien", url: "/master/patients", permission: PERMISSIONS.PATIENT_READ },
      { title: "Dokter", url: "/master/doctors", permission: PERMISSIONS.DOCTOR_READ },
      { title: "Perawat", url: "/master/nurses", permission: PERMISSIONS.NURSE_READ },
      { title: "Mesin HD", url: "/master/machines", permission: PERMISSIONS.HD_MACHINE_READ },
      { title: "Ruangan", url: "/master/rooms", permission: PERMISSIONS.ROOM_READ },
      { title: "Shift", url: "/master/shifts", permission: PERMISSIONS.SHIFT_READ },
      { title: "Protokol HD", url: "/master/protocols", permission: PERMISSIONS.HD_PROTOCOL_READ },
      { title: "Diagnosa", url: "/master/diagnoses", permission: PERMISSIONS.DIAGNOSIS_READ },
      { title: "Obat", url: "/master/medications", permission: PERMISSIONS.MEDICATION_READ },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { data: session } = useSession();

  const user = session?.user as { role?: string } | undefined;

  // Filter nav items based on user permissions
  const filteredNavItems = React.useMemo(() => {
    return navItems.filter((item) => {
      // If item excludes certain roles, check if user has one of them
      if (item.excludeRoles && item.excludeRoles.length > 0) {
        if (user?.role && item.excludeRoles.includes(user.role)) {
          return false;
        }
      }
      // If item has specific roles, check if user has one of them
      if (item.roles && item.roles.length > 0) {
        if (!user?.role || !item.roles.includes(user.role)) {
          return false;
        }
      }
      // If item has permission requirement, check if user has it
      if (item.permission) {
        if (!hasAnyPermission(user, [item.permission])) {
          return false;
        }
      }
      return true;
    }).map((item) => ({
      ...item,
      // Filter sub-items based on permissions
      items: item.items?.filter((subItem) => {
        if (subItem.permission) {
          return hasAnyPermission(user, [subItem.permission]);
        }
        return true;
      }),
    }));
  }, [user]);

  // Filter setting items based on user permissions
  const filteredSettingData = React.useMemo(() => {
    return settingData.filter((item) => {
      // If item excludes certain roles, check if user has one of them
      if (item.excludeRoles && item.excludeRoles.length > 0) {
        if (user?.role && item.excludeRoles.includes(user.role)) {
          return false;
        }
      }
      if (item.permission) {
        return hasAnyPermission(user, [item.permission]);
      }
      return true;
    });
  }, [user]);

  const navWithActive = React.useMemo(() => {
    return filteredNavItems.map((item) => ({
      ...item,
      isActive: pathname.startsWith(item.url),
      items: item.items?.map((subItem) => ({
        ...subItem,
        isActive: pathname === subItem.url,
      })),
    }));
  }, [pathname, filteredNavItems]);

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
        {filteredSettingData.length > 0 && <NavSetting data={filteredSettingData} />}
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
                onClick={async () => {
                  await signOut();
                  window.location.replace("/sign-in");
                }}
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
