"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, ScrollText, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/axios";

import { MasterPageLayout, TableSkeleton } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { EmptyState, ConfirmDialog } from "@/components/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProtocolForm } from "./protocol-form";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

type Protocol = {
  id: string;
  name: string;
  dialyzerType: string;
  bloodFlowRate: number | null;
  dialysateFlowRate: number | null;
  duration: number | null;
  anticoagulant: string | null;
  isActive: boolean;
};

export default function ProtocolsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Protocol | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["protocols", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: "10" });
      if (search) params.append("search", search);
      const res = await api.get(`/api/master/protocols?${params}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/master/protocols/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protocols"] });
      toast.success("Protokol berhasil dihapus");
      setDeletingId(null);
    },
    onError: () => toast.error("Gagal menghapus protokol"),
  });

  const columns: ColumnDef<Protocol>[] = [
    { accessorKey: "name", header: "Nama Protokol" },
    { accessorKey: "dialyzerType", header: "Tipe Dialyzer" },
    { accessorKey: "bloodFlowRate", header: "Qb (ml/min)", cell: ({ row }) => row.getValue("bloodFlowRate") || "-" },
    { accessorKey: "dialysateFlowRate", header: "Qd (ml/min)", cell: ({ row }) => row.getValue("dialysateFlowRate") || "-" },
    { accessorKey: "duration", header: "Durasi (menit)", cell: ({ row }) => row.getValue("duration") || "-" },
    { accessorKey: "anticoagulant", header: "Antikoagulan", cell: ({ row }) => row.getValue("anticoagulant") || "-" },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isActive") ? "success" : "secondary"}>
          {row.getValue("isActive") ? "Aktif" : "Nonaktif"}
        </Badge>
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
      label: "Total Protokol",
      value: data.meta.total || 0,
      icon: ScrollText,
      color: "default" as const,
    },
    {
      label: "Aktif",
      value: data.data?.filter((p: Protocol) => p.isActive).length || 0,
      icon: CheckCircle,
      color: "success" as const,
    },
    {
      label: "Nonaktif",
      value: data.data?.filter((p: Protocol) => !p.isActive).length || 0,
      icon: XCircle,
      color: "danger" as const,
    },
  ] : undefined;

  return (
    <>
      <MasterPageLayout
        title="Protokol HD"
        description="Kelola protokol hemodialisis"
        icon={ScrollText}
        stats={stats}
        addButtonLabel="Tambah Protokol"
        onAddClick={() => setIsFormOpen(true)}
      >
        {isLoading && !data ? (
          <TableSkeleton rows={5} columns={8} />
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
            searchPlaceholder="Cari nama protokol..."
            loading={isFetching}
          />
        )}
      </MasterPageLayout>

      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingItem(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Protokol" : "Tambah Protokol"}</DialogTitle>
          </DialogHeader>
          <ProtocolForm protocol={editingItem} onSuccess={() => { setIsFormOpen(false); setEditingItem(null); queryClient.invalidateQueries({ queryKey: ["protocols"] }); }} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus Protokol"
        description="Apakah Anda yakin ingin menghapus protokol ini?"
        confirmLabel="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </>
  );
}
