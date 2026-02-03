"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, Pill, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/axios";

import { MasterPageLayout, TableSkeleton } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { EmptyState, ConfirmDialog } from "@/components/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MedicationForm } from "./medication-form";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

type Medication = {
  id: string;
  name: string;
  genericName: string | null;
  category: string | null;
  unit: string;
  defaultDosage: string | null;
  route: string | null;
  notes: string | null;
  isActive: boolean;
};

export default function MedicationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Medication | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["medications", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: "10" });
      if (search) params.append("search", search);
      const res = await api.get(`/api/master/medications?${params}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/master/medications/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      toast.success("Obat berhasil dihapus");
      setDeletingId(null);
    },
    onError: () => toast.error("Gagal menghapus obat"),
  });

  const columns: ColumnDef<Medication>[] = [
    {
      accessorKey: "name",
      header: "Nama Obat",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          {row.original.genericName && (
            <span className="text-xs text-gray-400">{row.original.genericName}</span>
          )}
        </div>
      )
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => {
        const category = row.getValue("category") as string | null;
        return category ? (
          <Badge variant="outline">{category}</Badge>
        ) : (
          <span className="text-gray-400">-</span>
        );
      }
    },
    { accessorKey: "unit", header: "Satuan" },
    { accessorKey: "defaultDosage", header: "Dosis Default", cell: ({ row }) => row.getValue("defaultDosage") || "-" },
    { accessorKey: "route", header: "Rute", cell: ({ row }) => row.getValue("route") || "-" },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        row.getValue("isActive") ? (
          <Badge variant="success">Aktif</Badge>
        ) : (
          <Badge variant="secondary">Nonaktif</Badge>
        )
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingItem(row.original); setIsFormOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeletingId(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const stats = data?.meta ? [
    {
      label: "Total Obat",
      value: data.meta.total || 0,
      icon: Pill,
      color: "default" as const,
    },
    {
      label: "Aktif",
      value: data.data?.filter((m: Medication) => m.isActive).length || 0,
      icon: CheckCircle,
      color: "success" as const,
    },
    {
      label: "Nonaktif",
      value: data.data?.filter((m: Medication) => !m.isActive).length || 0,
      icon: XCircle,
      color: "danger" as const,
    },
  ] : undefined;

  return (
    <>
      <MasterPageLayout
        title="Obat"
        description="Kelola master data obat"
        icon={Pill}
        stats={stats}
        addButtonLabel="Tambah Obat"
        onAddClick={() => setIsFormOpen(true)}
      >
        {isLoading && !data ? (
          <TableSkeleton rows={5} columns={7} />
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
            searchPlaceholder="Cari nama obat..."
            loading={isFetching}
          />
        )}
      </MasterPageLayout>

      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Obat" : "Tambah Obat"}</DialogTitle>
          </DialogHeader>
          <MedicationForm medication={editingItem} onSuccess={() => { setIsFormOpen(false); setEditingItem(null); queryClient.invalidateQueries({ queryKey: ["medications"] }); }} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus Obat"
        description="Apakah Anda yakin ingin menghapus obat ini?"
        confirmLabel="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </>
  );
}
