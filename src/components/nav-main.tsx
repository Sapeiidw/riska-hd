"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export interface NavSubItem {
  title: string;
  url: string;
  isActive?: boolean;
}

export interface NavChildOPD {
  title: string;
  slug: string;
  isActive?: boolean;
  items: NavSubItem[];
}

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavSubItem[];
  children?: NavChildOPD[];
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-gray-500 font-semibold uppercase text-xs tracking-wider">
        Divisi
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  className="text-gray-700 hover:bg-purple-50 hover:text-purple-700 data-[active=true]:bg-purple-50 data-[active=true]:text-purple-700"
                >
                  {item.icon && <item.icon className="text-purple-500" />}
                  <span className="font-medium">{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-gray-400" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className="border-l-purple-200">
                  {/* Sub-menu items (Dashboard, Kenaikan Pangkat, dll) */}
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={subItem.isActive}
                        className="text-gray-600 hover:text-purple-700 hover:bg-purple-50 data-[active=true]:bg-gradient-to-r data-[active=true]:from-violet-500 data-[active=true]:via-purple-500 data-[active=true]:to-fuchsia-500 data-[active=true]:text-white data-[active=true]:font-medium data-[active=true]:shadow-md data-[active=true]:shadow-purple-500/25"
                      >
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}

                  {/* Child OPD items (UPT, Kelurahan, Sekolah, dll) */}
                  {item.children?.map((child) => (
                    <Collapsible
                      key={child.title}
                      asChild
                      defaultOpen={child.isActive}
                      className="group/child"
                    >
                      <SidebarMenuSubItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuSubButton className="text-gray-600 hover:text-purple-700 hover:bg-purple-50 font-medium">
                            <span>{child.title}</span>
                            <ChevronRight className="ml-auto h-3 w-3 transition-transform duration-200 group-data-[state=open]/child:rotate-90 text-gray-400" />
                          </SidebarMenuSubButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="border-l-purple-100 ml-2">
                            {child.items.map((childSubItem) => (
                              <SidebarMenuSubItem key={childSubItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={childSubItem.isActive}
                                  className="text-gray-600 hover:text-purple-700 hover:bg-purple-50 data-[active=true]:bg-gradient-to-r data-[active=true]:from-violet-500 data-[active=true]:via-purple-500 data-[active=true]:to-fuchsia-500 data-[active=true]:text-white data-[active=true]:font-medium data-[active=true]:shadow-md data-[active=true]:shadow-purple-500/25"
                                >
                                  <a href={childSubItem.url}>
                                    <span>{childSubItem.title}</span>
                                  </a>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuSubItem>
                    </Collapsible>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
