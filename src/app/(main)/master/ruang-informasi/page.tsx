"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api/axios";
import {
  Pencil,
  Trash2,
  Newspaper,
  CheckCircle,
  XCircle,
  Eye,
  Video,
  FileText,
  Megaphone,
  BookOpen,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

import { MasterPageLayout, TableSkeleton } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { EmptyState, ConfirmDialog } from "@/components/shared";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RUANG_INFORMASI_CATEGORIES } from "@/lib/validations/ruang-informasi";

type RuangInformasi = {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  excerpt: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  externalLinks: string | null;
  authorId: string | null;
  authorName: string | null;
  publishedAt: string | null;
  isPublished: boolean;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
};

const categoryIcons: Record<string, React.ElementType> = {
  artikel: FileText,
  video: Video,
  panduan: BookOpen,
  pengumuman: Megaphone,
};

const categoryColors: Record<string, "default" | "secondary" | "outline"> = {
  artikel: "default",
  video: "secondary",
  panduan: "outline",
  pengumuman: "default",
};

export default function RuangInformasiPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["ruang-informasi", page, search, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: "10" });
      if (search) params.append("search", search);
      if (categoryFilter) params.append("category", categoryFilter);
      const res = await api.get(`/api/master/ruang-informasi?${params}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/master/ruang-informasi/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ruang-informasi"] });
      toast.success("Konten berhasil dihapus");
      setDeletingId(null);
    },
    onError: () => toast.error("Gagal menghapus konten"),
  });

  const columns: ColumnDef<RuangInformasi>[] = useMemo(() => [
    {
      accessorKey: "title",
      header: "Judul",
      cell: ({ row }) => {
        const item = row.original;
        const hasImage = !!item.imageUrl;
        const hasVideo = !!item.videoUrl;
        const hasLinks = item.externalLinks && JSON.parse(item.externalLinks).length > 0;

        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium">{item.title}</span>
            <div className="flex items-center gap-2">
              {hasImage && (
                <ImageIcon className="h-3 w-3 text-muted-foreground" />
              )}
              {hasVideo && (
                <Video className="h-3 w-3 text-muted-foreground" />
              )}
              {hasLinks && (
                <LinkIcon className="h-3 w-3 text-muted-foreground" />
              )}
              {item.excerpt && (
                <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                  {item.excerpt}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        const Icon = categoryIcons[category] || FileText;
        const label =
          RUANG_INFORMASI_CATEGORIES.find((c) => c.value === category)?.label ||
          category;
        return (
          <Badge variant={categoryColors[category] || "outline"} className="gap-1">
            <Icon className="h-3 w-3" />
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "authorName",
      header: "Penulis",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.getValue("authorName") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "viewCount",
      header: "Views",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Eye className="h-3 w-3" />
          {row.getValue("viewCount")}
        </div>
      ),
    },
    {
      accessorKey: "isPublished",
      header: "Status",
      cell: ({ row }) =>
        row.getValue("isPublished") ? (
          <Badge variant="success">Dipublikasi</Badge>
        ) : (
          <Badge variant="secondary">Draft</Badge>
        ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push(`/master/ruang-informasi/${row.original.id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => setDeletingId(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], []);

  const stats = data?.meta
    ? [
        {
          label: "Total Konten",
          value: data.meta.total || 0,
          icon: Newspaper,
          color: "default" as const,
        },
        {
          label: "Dipublikasi",
          value: data.data?.filter((d: RuangInformasi) => d.isPublished).length || 0,
          icon: CheckCircle,
          color: "success" as const,
        },
        {
          label: "Draft",
          value: data.data?.filter((d: RuangInformasi) => !d.isPublished).length || 0,
          icon: XCircle,
          color: "danger" as const,
        },
      ]
    : undefined;

  return (
    <>
      <MasterPageLayout
        title="Ruang Informasi"
        description="Kelola konten informasi dan edukasi"
        icon={Newspaper}
        stats={stats}
        addButtonLabel="Tambah Konten"
        onAddClick={() => router.push("/master/ruang-informasi/tambah")}
        extraActions={
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value === "all" ? "" : value);
              setPage(1);
            }}
          >
            <SelectTrigger className="sm:w-[180px]">
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
        }
      >
        {isLoading && !data ? (
          <TableSkeleton rows={5} columns={6} />
        ) : error && !data ? (
          <EmptyState title="Gagal memuat data" />
        ) : (
          <DataTable
            columns={columns}
            data={data?.data || []}
            meta={data?.meta}
            onPageChange={setPage}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchValue={search}
            searchPlaceholder="Cari judul atau konten..."
            loading={isFetching}
          />
        )}
      </MasterPageLayout>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus Konten"
        description="Apakah Anda yakin ingin menghapus konten ini?"
        confirmLabel="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </>
  );
}
