"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Calendar,
  Eye,
  User,
  Video,
  FileText,
  Megaphone,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RUANG_INFORMASI_CATEGORIES } from "@/lib/validations/ruang-informasi";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

type RuangInformasi = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  imageUrl: string | null;
  authorName: string | null;
  publishedAt: string | null;
  viewCount: number;
  createdAt: string;
};

type Suggestion = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  imageUrl: string | null;
};

const categoryIcons: Record<string, React.ElementType> = {
  artikel: FileText,
  video: Video,
  panduan: BookOpen,
  pengumuman: Megaphone,
};

const categoryColors: Record<string, string> = {
  artikel: "bg-blue-100 text-blue-700",
  video: "bg-purple-100 text-purple-700",
  panduan: "bg-green-100 text-green-700",
  pengumuman: "bg-orange-100 text-orange-700",
};

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function SearchAutocomplete({
  onSearch,
  initialValue = "",
}: {
  onSearch: (query: string) => void;
  initialValue?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: suggestions, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ["search-suggestions", query],
    queryFn: async () => {
      if (query.length < 2) return [];
      const res = await fetch(
        `/api/public/ruang-informasi/suggestions?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data as Suggestion[];
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  const handleSearch = useCallback(() => {
    onSearch(query);
    setIsOpen(false);
  }, [query, onSearch]);

  const handleSelectSuggestion = useCallback(
    (suggestion: Suggestion) => {
      router.push(`/informasi/${suggestion.slug}`);
      setIsOpen(false);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !suggestions?.length) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const showDropdown = isOpen && query.length >= 2;

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Cari artikel, panduan, video..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
          aria-label="Cari artikel"
          aria-expanded={showDropdown}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              onSearch("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          id="search-suggestions"
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border shadow-lg z-50 overflow-hidden"
          role="listbox"
        >
          {isLoadingSuggestions ? (
            <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Mencari...</span>
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="py-2">
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Rekomendasi
              </div>
              {suggestions.map((suggestion, index) => {
                const Icon = categoryIcons[suggestion.category] || FileText;
                const categoryLabel =
                  RUANG_INFORMASI_CATEGORIES.find(
                    (c) => c.value === suggestion.category
                  )?.label || suggestion.category;

                return (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full px-3 py-2.5 flex items-start gap-3 text-left transition-colors",
                      selectedIndex === index
                        ? "bg-sky-50"
                        : "hover:bg-gray-50"
                    )}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    {suggestion.imageUrl ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={suggestion.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                          categoryColors[suggestion.category]?.replace(
                            "text-",
                            "bg-"
                          ) || "bg-gray-100"
                        )}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 line-clamp-1">
                        {highlightMatch(suggestion.title, query)}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] px-1.5 py-0 h-4",
                            categoryColors[suggestion.category]
                          )}
                        >
                          {categoryLabel}
                        </Badge>
                        {suggestion.excerpt && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {suggestion.excerpt.slice(0, 50)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              <div className="border-t mt-2 pt-2 px-3 pb-2">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full text-sm text-sky-600 hover:text-sky-700 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-sky-50 transition-colors"
                >
                  <Search className="h-3.5 w-3.5" />
                  Cari &quot;{query}&quot;
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Tidak ada hasil untuk &quot;{query}&quot;</p>
              <button
                type="button"
                onClick={handleSearch}
                className="mt-2 text-sky-600 hover:underline"
              >
                Cari di semua artikel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ContentCard({ item }: { item: RuangInformasi }) {
  const Icon = categoryIcons[item.category] || FileText;
  const categoryLabel =
    RUANG_INFORMASI_CATEGORIES.find((c) => c.value === item.category)?.label ||
    item.category;

  return (
    <Link
      href={`/informasi/${item.slug}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-video bg-gray-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-100 to-cyan-100">
            <Icon className="h-12 w-12 text-sky-400" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className={`${categoryColors[item.category]} gap-1 border-0`}>
            <Icon className="h-3 w-3" />
            {categoryLabel}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-sky-600 transition-colors">
          {item.title}
        </h2>
        {item.excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {item.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          {item.authorName && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {item.authorName}
            </div>
          )}
          {item.publishedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <time dateTime={item.publishedAt}>
                {formatDistanceToNow(new Date(item.publishedAt), {
                  addSuffix: true,
                  locale: id,
                })}
              </time>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {item.viewCount}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ContentSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border">
      <Skeleton className="aspect-video" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function InformasiList() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");

  // Read category from URL on mount
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setCategory(categoryParam);
    }
  }, [searchParams]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-ruang-informasi", page, search, category],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: "12" });
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      const res = await fetch(`/api/public/ruang-informasi?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ruang Informasi
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Temukan artikel, panduan, dan informasi terbaru seputar hemodialisis
          untuk membantu perjalanan kesehatan Anda.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchAutocomplete onSearch={handleSearch} initialValue={search} />
          <Select
            value={category || "all"}
            onValueChange={(value) => {
              setCategory(value === "all" ? "" : value);
              setPage(1);
            }}
          >
            <SelectTrigger
              className="w-full sm:w-[180px]"
              aria-label="Filter kategori"
            >
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {RUANG_INFORMASI_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active filters */}
        {(search || category) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <span className="text-sm text-muted-foreground">Filter aktif:</span>
            {search && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSearch("")}
              >
                Pencarian: {search}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {category && (
              <Badge
                variant="secondary"
                className={cn(
                  "gap-1 cursor-pointer",
                  categoryColors[category]
                )}
                onClick={() => setCategory("")}
              >
                {RUANG_INFORMASI_CATEGORIES.find((c) => c.value === category)
                  ?.label || category}
                <X className="h-3 w-3" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ContentSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Gagal memuat konten</p>
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {search || category
              ? "Tidak ada konten yang sesuai dengan pencarian"
              : "Belum ada konten yang dipublikasikan"}
          </p>
          {(search || category) && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                handleSearch("");
                setCategory("");
              }}
            >
              Reset Filter
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Results count */}
          {data?.meta && (
            <p className="text-sm text-muted-foreground mb-4">
              Menampilkan {data.data.length} dari {data.meta.total} artikel
            </p>
          )}

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
          >
            {data?.data?.map((item: RuangInformasi) => (
              <article key={item.id} role="listitem">
                <ContentCard item={item} />
              </article>
            ))}
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <nav
              className="flex items-center justify-center gap-2 mt-8"
              aria-label="Pagination"
            >
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Halaman {page} dari {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setPage((p) => Math.min(data.meta.totalPages, p + 1))
                }
                disabled={page === data.meta.totalPages}
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
