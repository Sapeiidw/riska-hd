"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Search } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useOpdList } from "@/lib/opd";
import { OpdConfig } from "@/lib/opd/types";

const menuItems = [
  { title: "Dashboard", slug: "" },
  { title: "Kenaikan Pangkat", slug: "kenaikan-pangkat" },
  { title: "Status Dokumen Wajib", slug: "status-dokumen-wajib" },
  { title: "Golongan Pegawai", slug: "golongan-pegawai" },
  { title: "Status SK Kenpa", slug: "status-sk-kenaikan-pangkat" },
  { title: "Status Kenaikan Pangkat", slug: "status-kenaikan-pangkat" },
  { title: "Status Pegawai", slug: "status-pegawai" },
];

interface SearchResult {
  opd: OpdConfig;
  menu: { title: string; slug: string };
  url: string;
}

function buildSearchResults(opdList: OpdConfig[]): SearchResult[] {
  const results: SearchResult[] = [];

  opdList.forEach((opd) => {
    menuItems.forEach((menu) => {
      const url = menu.slug ? `/${opd.slug}/${menu.slug}` : `/${opd.slug}`;
      results.push({ opd, menu, url });
    });
  });

  return results;
}

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { data: opdList } = useOpdList();

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

  const searchResults = React.useMemo(() => {
    if (!opdList) return [];
    return buildSearchResults(opdList);
  }, [opdList]);

  const handleSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  // Group results by parent OPD
  const groupedResults = React.useMemo(() => {
    if (!opdList) return new Map<string, SearchResult[]>();

    const parentOpds = opdList.filter((opd) => opd.parent_id === null);
    const grouped = new Map<string, SearchResult[]>();

    parentOpds.forEach((parent) => {
      // Get parent results
      const parentResults = searchResults.filter(
        (r) => r.opd.id === parent.id
      );

      // Get children results
      const childrenResults = searchResults.filter(
        (r) => r.opd.parent_id === parent.id
      );

      grouped.set(parent.singkatan, [...parentResults, ...childrenResults]);
    });

    return grouped;
  }, [opdList, searchResults]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Cari Menu"
      description="Ketik untuk mencari menu OPD..."
    >
      <CommandInput placeholder="Cari menu OPD..." />
      <CommandList>
        <CommandEmpty>Menu tidak ditemukan.</CommandEmpty>
        {Array.from(groupedResults.entries()).map(([groupName, results]) => (
          <CommandGroup key={groupName} heading={groupName}>
            {results.map((result) => (
              <CommandItem
                key={result.url}
                value={`${result.opd.nama} ${result.opd.singkatan} ${result.menu.title}`}
                onSelect={() => handleSelect(result.url)}
              >
                <BookOpen className="mr-2 h-4 w-4 text-purple-500" />
                <span className="flex-1">
                  {result.opd.parent_id !== null && (
                    <span className="text-muted-foreground">
                      {result.opd.singkatan} /{" "}
                    </span>
                  )}
                  {result.menu.title}
                </span>
                {result.opd.parent_id === null && (
                  <span className="text-xs text-muted-foreground">
                    {result.opd.singkatan}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
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
