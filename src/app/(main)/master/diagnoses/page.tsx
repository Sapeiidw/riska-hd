"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, ClipboardList, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/axios";

import { MasterPageLayout, TableSkeleton } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { EmptyState, ConfirmDialog } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DiagnosisForm } from "./diagnosis-form";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

type Diagnosis = {
  id: string;
  icdCode: string | null;
  name: string;
  category: string | null;
  description: string | null;
  isActive: boolean;
};

export default function DiagnosesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Diagnosis | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["diagnoses", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: "10" });
      if (search) params.append("search", search);
      const res = await api.get(`/api/master/diagnoses?${params}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/master/diagnoses/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagnoses"] });
      toast.success("Diagnosa berhasil dihapus");
      setDeletingId(null);
    },
    onError: () => toast.error("Gagal menghapus diagnosa"),
  });

  const columns: ColumnDef<Diagnosis>[] = [
    {
      accessorKey: "icdCode",
      header: "Kode ICD",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("icdCode") || "-"}</span>
      )
    },
    { accessorKey: "name", header: "Nama Diagnosa" },
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
      label: "Total Diagnosa",
      value: data.meta.total || 0,
      icon: ClipboardList,
      color: "default" as const,
    },
    {
      label: "Aktif",
      value: data.data?.filter((d: Diagnosis) => d.isActive).length || 0,
      icon: CheckCircle,
      color: "success" as const,
    },
    {
      label: "Nonaktif",
      value: data.data?.filter((d: Diagnosis) => !d.isActive).length || 0,
      icon: XCircle,
      color: "danger" as const,
    },
  ] : undefined;

  return (
    <>
      <MasterPageLayout
        title="Diagnosa"
        description="Kelola master data diagnosa"
        icon={ClipboardList}
        stats={stats}
        searchPlaceholder="Cari nama atau kode ICD..."
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        addButtonLabel="Tambah Diagnosa"
        onAddClick={() => setIsFormOpen(true)}
      >
        {isLoading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : error ? (
          <EmptyState title="Gagal memuat data" />
        ) : data?.data?.length === 0 ? (
          <EmptyState title="Belum ada diagnosa">
            <Button onClick={() => setIsFormOpen(true)}>Tambah Diagnosa</Button>
          </EmptyState>
        ) : (
          <DataTable columns={columns} data={data?.data || []} meta={data?.meta} onPageChange={setPage} />
        )}
      </MasterPageLayout>

      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Diagnosa" : "Tambah Diagnosa"}</DialogTitle>
          </DialogHeader>
          <DiagnosisForm
            diagnosis={editingItem}
            onSuccess={() => { setIsFormOpen(false); setEditingItem(null); queryClient.invalidateQueries({ queryKey: ["diagnoses"] }); }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus Diagnosa"
        description="Apakah Anda yakin ingin menghapus diagnosa ini?"
        confirmLabel="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </>
  );
}
