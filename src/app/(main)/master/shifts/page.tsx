"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, Clock, CheckCircle, XCircle, Users } from "lucide-react";
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
import { ShiftForm } from "./shift-form";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

type Shift = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  maxPatients: number | null;
  isActive: boolean;
};

async function fetchShifts(page: number) {
  const res = await api.get(`/api/master/shifts?page=${page}&limit=10`);
  return res.data;
}

async function deleteShift(id: string) {
  const res = await api.delete(`/api/master/shifts/${id}`);
  return res.data;
}

export default function ShiftsPage() {
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["shifts", page],
    queryFn: () => fetchShifts(page),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      toast.success("Shift berhasil dihapus");
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Gagal menghapus shift");
    },
  });

  const columns: ColumnDef<Shift>[] = [
    {
      accessorKey: "name",
      header: "Nama Shift",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      )
    },
    {
      accessorKey: "startTime",
      header: "Jam Mulai",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.getValue("startTime")}
        </Badge>
      )
    },
    {
      accessorKey: "endTime",
      header: "Jam Selesai",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.getValue("endTime")}
        </Badge>
      )
    },
    {
      accessorKey: "maxPatients",
      header: "Maks. Pasien",
      cell: ({ row }) => {
        const max = row.getValue("maxPatients") as number | null;
        return max ? (
          <span className="flex items-center gap-1 text-sm">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            {max}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setEditingShift(row.original);
              setIsFormOpen(true);
            }}
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
  ];

  const stats = data?.meta ? [
    {
      label: "Total Shift",
      value: data.meta.total || 0,
      icon: Clock,
      color: "default" as const,
    },
    {
      label: "Aktif",
      value: data.data?.filter((s: Shift) => s.isActive).length || 0,
      icon: CheckCircle,
      color: "success" as const,
    },
    {
      label: "Nonaktif",
      value: data.data?.filter((s: Shift) => !s.isActive).length || 0,
      icon: XCircle,
      color: "danger" as const,
    },
  ] : undefined;

  return (
    <>
      <MasterPageLayout
        title="Shift"
        description="Kelola jadwal shift HD"
        icon={Clock}
        stats={stats}
        addButtonLabel="Tambah Shift"
        onAddClick={() => setIsFormOpen(true)}
      >
        {isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : error ? (
          <EmptyState title="Gagal memuat data" />
        ) : data?.data?.length === 0 ? (
          <EmptyState title="Belum ada shift">
            <Button onClick={() => setIsFormOpen(true)}>Tambah Shift</Button>
          </EmptyState>
        ) : (
          <DataTable
            columns={columns}
            data={data?.data || []}
            meta={data?.meta}
            onPageChange={setPage}
          />
        )}
      </MasterPageLayout>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingShift(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingShift ? "Edit Shift" : "Tambah Shift"}
            </DialogTitle>
          </DialogHeader>
          <ShiftForm
            shift={editingShift}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingShift(null);
              queryClient.invalidateQueries({ queryKey: ["shifts"] });
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus Shift"
        description="Apakah Anda yakin ingin menghapus shift ini?"
        confirmLabel="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </>
  );
}
