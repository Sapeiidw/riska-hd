"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-sky-600 transition-colors">
          {item.title}
        </h3>
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
              {formatDistanceToNow(new Date(item.publishedAt), {
                addSuffix: true,
                locale: id,
              })}
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

export default function InformasiPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<string>("");

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

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
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari artikel..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Cari</Button>
          </form>
          <Select
            value={category}
            onValueChange={(value) => {
              setCategory(value === "all" ? "" : value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
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
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data?.map((item: RuangInformasi) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Halaman {page} dari {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
