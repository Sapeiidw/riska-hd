"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Home, Search, Settings, User } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Profile", url: "/user", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Cari Menu"
      description="Ketik untuk mencari menu..."
    >
      <CommandInput placeholder="Cari menu..." />
      <CommandList>
        <CommandEmpty>Menu tidak ditemukan.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {menuItems.map((item) => (
            <CommandItem
              key={item.url}
              value={item.title}
              onSelect={() => handleSelect(item.url)}
            >
              <item.icon className="mr-2 h-4 w-4 text-purple-500" />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function CommandMenuTrigger() {
  return (
    <button
      className="flex items-center gap-2 rounded-lg border border-purple-200 bg-white/50 px-3 py-1.5 text-sm text-gray-500 hover:bg-purple-50 hover:text-purple-700 transition-colors"
      onClick={() => {
        const event = new KeyboardEvent("keydown", {
          key: "k",
          ctrlKey: true,
        });
        document.dispatchEvent(event);
      }}
    >
      <Search className="h-4 w-4" />
      <span>Cari menu...</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">Ctrl</span>K
      </kbd>
    </button>
  );
}
