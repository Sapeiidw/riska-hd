"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api/axios";
import {
  Search,
  Video,
  FileText,
  Megaphone,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  TrendingUp,
  Clock,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  artikel: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
  video: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
  panduan: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  pengumuman: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
};

function calculateReadingTime(excerpt: string | null): number {
  if (!excerpt) return 3;
  const words = excerpt.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil((words * 5) / 200));
}

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
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: suggestions, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ["search-suggestions", query],
    queryFn: async () => {
      if (query.length < 2) return [];
      const res = await api.get(
        `/api/public/ruang-informasi/suggestions?q=${encodeURIComponent(query)}`
      );
      return res.data.data as Suggestion[];
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60,
  });

  const handleSearch = useCallback(() => {
    onSearch(query);
    setIsOpen(false);
  }, [query, onSearch]);

  const handleSelectSuggestion = useCallback(
    (suggestion: Suggestion) => {
      window.location.href = `/informasi/${suggestion.slug}`;
      setIsOpen(false);
    },
    []
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

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const showDropdown = isOpen && query.length >= 2;

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Cari artikel..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-12 py-3 h-12 text-base rounded-full border-gray-200 focus:border-emerald-300 focus:ring-emerald-200 bg-gray-50 focus:bg-white transition-colors"
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
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          id="search-suggestions"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border shadow-xl z-50 overflow-hidden"
          role="listbox"
        >
          {isLoadingSuggestions ? (
            <div className="p-6 flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Mencari...</span>
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="py-3">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 flex items-center gap-1.5 uppercase tracking-wide">
                <TrendingUp className="h-3.5 w-3.5" />
                Rekomendasi
              </div>
              {suggestions.map((suggestion, index) => {
                const Icon = categoryIcons[suggestion.category] || FileText;
                return (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full px-4 py-3 flex items-start gap-4 text-left transition-colors",
                      selectedIndex === index ? "bg-gray-50" : "hover:bg-gray-50"
                    )}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    {suggestion.imageUrl ? (
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={suggestion.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
                        <Icon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 line-clamp-2">
                        {highlightMatch(suggestion.title, query)}
                      </div>
                      {suggestion.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                          {suggestion.excerpt}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
              <div className="border-t mt-2 pt-2 px-4 pb-2">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full text-sm text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
                >
                  <Search className="h-4 w-4" />
                  Cari &quot;{query}&quot;
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Tidak ada hasil untuk &quot;{query}&quot;</p>
              <button
                type="button"
                onClick={handleSearch}
                className="mt-3 text-sm text-emerald-600 hover:underline font-medium"
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

// Featured Article Card - dengan background & shadow jelas
function FeaturedCard({ item }: { item: RuangInformasi }) {
  const Icon = categoryIcons[item.category] || FileText;
  const categoryLabel =
    RUANG_INFORMASI_CATEGORIES.find((c) => c.value === item.category)?.label ||
    item.category;
  const colors = categoryColors[item.category] || categoryColors.artikel;
  const readingTime = calculateReadingTime(item.excerpt);

  return (
    <Link
      href={`/informasi/${item.slug}`}
      className="group block overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all mb-6"
    >
      {/* Image - Full width di atas */}
      <div className="relative aspect-[16/9] sm:aspect-[2/1] overflow-hidden bg-gray-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
            <Icon className="h-16 w-16 text-emerald-300" />
          </div>
        )}
        {/* Category Badge di atas image */}
        <div className="absolute top-3 left-3">
          <Badge className={cn("font-medium", colors.bg, colors.text, "border", colors.border)}>
            <Icon className="h-3 w-3 mr-1" />
            {categoryLabel}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {item.title}
        </h2>

        {item.excerpt && (
          <p className="text-sm sm:text-base text-gray-600 line-clamp-2 mb-4">
            {item.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {item.authorName?.charAt(0) || "R"}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">{item.authorName || "RISKA HD"}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {item.publishedAt && (
              <span>
                {formatDistanceToNow(new Date(item.publishedAt), {
                  addSuffix: true,
                  locale: id,
                })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readingTime} menit
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Regular Article Card - dengan background yang jelas
function ContentCard({ item }: { item: RuangInformasi }) {
  const Icon = categoryIcons[item.category] || FileText;
  const categoryLabel =
    RUANG_INFORMASI_CATEGORIES.find((c) => c.value === item.category)?.label ||
    item.category;
  const colors = categoryColors[item.category] || categoryColors.artikel;
  const readingTime = calculateReadingTime(item.excerpt);

  return (
    <Link
      href={`/informasi/${item.slug}`}
      className="group block overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
    >
      <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
        {/* Thumbnail */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100 shrink-0">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
              <Icon className="h-8 w-8 text-emerald-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Category Badge */}
          <Badge className={cn("font-medium text-[10px] sm:text-xs w-fit mb-2", colors.bg, colors.text, "border", colors.border)}>
            {categoryLabel}
          </Badge>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors mb-1">
            {item.title}
          </h3>

          {/* Excerpt - Hidden di mobile kecil */}
          {item.excerpt && (
            <p className="hidden sm:block text-sm text-gray-500 line-clamp-2 mb-auto">
              {item.excerpt}
            </p>
          )}

          {/* Meta - di bagian bawah */}
          <div className="flex items-center gap-2 mt-auto pt-2 text-[10px] sm:text-xs text-gray-500">
            <span className="font-medium text-gray-700">{item.authorName || "RISKA HD"}</span>
            {item.publishedAt && (
              <>
                <span className="text-gray-300">|</span>
                <span>
                  {formatDistanceToNow(new Date(item.publishedAt), {
                    addSuffix: true,
                    locale: id,
                  })}
                </span>
              </>
            )}
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {readingTime}m
            </span>
            {item.viewCount > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-0.5">
                  <Eye className="h-3 w-3" />
                  {item.viewCount}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ContentSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm">
      <div className="flex gap-4 p-4">
        <Skeleton className="w-32 h-32 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-48 mt-auto" />
        </div>
      </div>
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm mb-6">
      <Skeleton className="aspect-[2/1]" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-32" />
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

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setCategory(categoryParam);
    }
  }, [searchParams]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-ruang-informasi", page, search, category],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: "10" });
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      const res = await api.get(`/api/public/ruang-informasi?${params}`);
      return res.data;
    },
  });

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const firstItem = data?.data?.[0];
  const restItems = data?.data?.slice(1) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Ruang Informasi
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-lg mx-auto">
            Artikel, panduan, dan informasi terbaru seputar hemodialisis
          </p>

          {/* Search Bar */}
          <SearchAutocomplete onSearch={handleSearch} initialValue={search} />

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap mt-6">
            <button
              onClick={() => {
                setCategory("");
                setPage(1);
              }}
              className={cn(
                "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors",
                !category
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Semua
            </button>
            {RUANG_INFORMASI_CATEGORIES.map((cat) => {
              const Icon = categoryIcons[cat.value] || FileText;
              return (
                <button
                  key={cat.value}
                  onClick={() => {
                    setCategory(cat.value);
                    setPage(1);
                  }}
                  className={cn(
                    "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5",
                    category === cat.value
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(search || category) && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Filter:</span>
            {search && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-gray-200 bg-white border text-xs"
                onClick={() => handleSearch("")}
              >
                &quot;{search}&quot;
                <X className="h-3 w-3" />
              </Badge>
            )}
            {category && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-gray-200 bg-white border text-xs"
                onClick={() => setCategory("")}
              >
                {RUANG_INFORMASI_CATEGORIES.find((c) => c.value === category)?.label}
                <X className="h-3 w-3" />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
        {isLoading ? (
          <>
            <FeaturedSkeleton />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <ContentSkeleton key={i} />
              ))}
            </div>
          </>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-500">Gagal memuat konten</p>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">
              {search || category ? "Tidak ada hasil" : "Belum ada artikel"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {search || category
                ? "Coba ubah kata kunci atau filter"
                : "Artikel akan ditampilkan di sini"}
            </p>
            {(search || category) && (
              <Button
                variant="outline"
                size="sm"
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
              <p className="text-xs text-gray-500 mb-4">
                {data.meta.total} artikel ditemukan
              </p>
            )}

            {/* Featured Article */}
            {firstItem && page === 1 && !search && (
              <FeaturedCard item={firstItem} />
            )}

            {/* Article List */}
            <div className="space-y-3">
              {(page === 1 && !search ? restItems : data?.data)?.map(
                (item: RuangInformasi) => (
                  <ContentCard key={item.id} item={item} />
                )
              )}
            </div>

            {/* Pagination */}
            {data?.meta && data.meta.totalPages > 1 && (
              <nav className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="gap-1.5 rounded-full text-xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  {page} / {data.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                  disabled={page === data.meta.totalPages}
                  className="gap-1.5 rounded-full text-xs"
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
