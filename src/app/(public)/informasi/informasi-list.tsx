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
  BookmarkPlus,
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

// Calculate reading time (average 200 words per minute)
function calculateReadingTime(excerpt: string | null): number {
  if (!excerpt) return 3;
  const words = excerpt.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil((words * 5) / 200)); // Estimate full article is 5x excerpt
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
          className="w-full pl-12 pr-12 py-3 h-12 text-base rounded-full border-gray-200 focus:border-gray-300 focus:ring-0 bg-gray-50 focus:bg-white transition-colors"
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

// Soft black color constants (matching Medium)
const softBlack = "rgba(41, 41, 41, 1)";
const softGray = "rgba(117, 117, 117, 1)";

// Featured Article Card - Large, horizontal
function FeaturedCard({ item }: { item: RuangInformasi }) {
  const Icon = categoryIcons[item.category] || FileText;
  const categoryLabel =
    RUANG_INFORMASI_CATEGORIES.find((c) => c.value === item.category)?.label ||
    item.category;
  const readingTime = calculateReadingTime(item.excerpt);

  return (
    <Link
      href={`/informasi/${item.slug}`}
      className="group grid md:grid-cols-2 gap-6 md:gap-8 py-8 border-b border-gray-100"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] md:aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 order-1 md:order-2">
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
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center order-2 md:order-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[13px] font-medium text-emerald-600">{categoryLabel}</span>
        </div>

        <h2
          className="text-[22px] md:text-[26px] font-bold leading-[1.3] mb-3 group-hover:text-emerald-600 transition-colors"
          style={{ fontFamily: "'Georgia', serif", color: softBlack }}
        >
          {item.title}
        </h2>

        {item.excerpt && (
          <p
            className="text-[16px] md:text-[17px] leading-[1.6] line-clamp-3 mb-4"
            style={{ fontFamily: "'Georgia', serif", color: softGray }}
          >
            {item.excerpt}
          </p>
        )}

        <div className="flex items-center gap-3 text-[13px]" style={{ color: softGray }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {item.authorName?.charAt(0) || "R"}
              </span>
            </div>
            <span style={{ color: softBlack }}>{item.authorName || "RISKA HD"}</span>
          </div>
          {item.publishedAt && (
            <>
              <span>·</span>
              <span>
                {formatDistanceToNow(new Date(item.publishedAt), {
                  addSuffix: true,
                  locale: id,
                })}
              </span>
            </>
          )}
          <span>·</span>
          <span>{readingTime} min read</span>
        </div>
      </div>
    </Link>
  );
}

// Regular Article Card - Medium style
function ContentCard({ item }: { item: RuangInformasi }) {
  const Icon = categoryIcons[item.category] || FileText;
  const categoryLabel =
    RUANG_INFORMASI_CATEGORIES.find((c) => c.value === item.category)?.label ||
    item.category;
  const readingTime = calculateReadingTime(item.excerpt);

  return (
    <article className="group flex gap-4 md:gap-6 py-6 border-b border-gray-100">
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <span className="text-white text-[10px] font-medium">
              {item.authorName?.charAt(0) || "R"}
            </span>
          </div>
          <span className="text-[13px]" style={{ color: softBlack }}>{item.authorName || "RISKA HD"}</span>
        </div>

        <Link href={`/informasi/${item.slug}`}>
          <h2
            className="text-[16px] md:text-[18px] font-bold leading-[1.4] mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors"
            style={{ fontFamily: "'Georgia', serif", color: softBlack }}
          >
            {item.title}
          </h2>
        </Link>

        {item.excerpt && (
          <p className="hidden sm:block line-clamp-2 text-[14px] md:text-[15px] leading-[1.6] mb-3" style={{ color: softGray }}>
            {item.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px]" style={{ color: softGray }}>
            {item.publishedAt && (
              <time dateTime={item.publishedAt}>
                {formatDistanceToNow(new Date(item.publishedAt), {
                  addSuffix: true,
                  locale: id,
                })}
              </time>
            )}
            <span>·</span>
            <span>{readingTime} min read</span>
            <span>·</span>
            <Badge variant="secondary" className="text-[11px] px-2 py-0 h-5 bg-gray-100 font-normal" style={{ color: softGray }}>
              {categoryLabel}
            </Badge>
          </div>

          <button
            onClick={(e) => e.preventDefault()}
            className="p-2 rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <BookmarkPlus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Thumbnail */}
      <Link href={`/informasi/${item.slug}`} className="flex-shrink-0">
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-lg overflow-hidden bg-gray-100">
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
      </Link>
    </article>
  );
}

function ContentSkeleton() {
  return (
    <div className="flex gap-6 py-6 border-b border-gray-100">
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="w-28 h-28 rounded-lg" />
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8 py-8 border-b border-gray-100">
      <div className="space-y-4 order-2 md:order-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="aspect-[4/3] rounded-lg order-1 md:order-2" />
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
    <div className="min-h-screen bg-white">
      {/* Hero Section - Medium style */}
      <div className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-center">
          <h1
            className="text-[32px] md:text-[40px] font-bold mb-4 leading-[1.2]"
            style={{ fontFamily: "'Georgia', serif", color: softBlack }}
          >
            Ruang Informasi
          </h1>
          <p className="text-[17px] md:text-[19px] leading-[1.5] mb-8 max-w-xl mx-auto" style={{ color: softGray }}>
            Artikel, panduan, dan informasi terbaru seputar hemodialisis
          </p>

          {/* Search Bar */}
          <SearchAutocomplete onSearch={handleSearch} initialValue={search} />

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap mt-8">
            <button
              onClick={() => {
                setCategory("");
                setPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-full text-[13px] font-medium transition-colors",
                !category
                  ? "text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              )}
              style={!category ? { backgroundColor: softBlack } : { color: softBlack }}
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
                    "px-4 py-2 rounded-full text-[13px] font-medium transition-colors flex items-center gap-1.5",
                    category === cat.value
                      ? "text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  )}
                  style={category === cat.value ? { backgroundColor: softBlack } : { color: softBlack }}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(search || category) && (
        <div className="max-w-3xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Filter:</span>
            {search && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-gray-200 bg-gray-100"
                onClick={() => handleSearch("")}
              >
                &quot;{search}&quot;
                <X className="h-3 w-3" />
              </Badge>
            )}
            {category && (
              <Badge
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-gray-200 bg-gray-100"
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
      <div className="max-w-3xl mx-auto px-4 py-6">
        {isLoading ? (
          <>
            <FeaturedSkeleton />
            {Array.from({ length: 4 }).map((_, i) => (
              <ContentSkeleton key={i} />
            ))}
          </>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Gagal memuat konten</p>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-[18px] font-medium mb-2" style={{ color: softBlack }}>
              {search || category ? "Tidak ada hasil" : "Belum ada artikel"}
            </h3>
            <p className="text-[15px] mb-6" style={{ color: softGray }}>
              {search || category
                ? "Coba ubah kata kunci atau filter pencarian"
                : "Artikel akan ditampilkan di sini"}
            </p>
            {(search || category) && (
              <Button
                variant="outline"
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
              <p className="text-[13px] mb-4" style={{ color: softGray }}>
                {data.meta.total} artikel ditemukan
              </p>
            )}

            {/* Featured Article */}
            {firstItem && page === 1 && !search && (
              <FeaturedCard item={firstItem} />
            )}

            {/* Article List */}
            <div>
              {(page === 1 && !search ? restItems : data?.data)?.map(
                (item: RuangInformasi) => (
                  <ContentCard key={item.id} item={item} />
                )
              )}
            </div>

            {/* Pagination - Medium style */}
            {data?.meta && data.meta.totalPages > 1 && (
              <nav className="flex items-center justify-center gap-4 mt-10 pt-8 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="gap-2 rounded-full text-[13px]"
                  style={{ color: softBlack }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
                <span className="text-[13px]" style={{ color: softGray }}>
                  {page} / {data.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                  disabled={page === data.meta.totalPages}
                  className="gap-2 rounded-full text-[13px]"
                  style={{ color: softBlack }}
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
