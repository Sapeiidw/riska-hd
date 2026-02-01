"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, Cpu, CheckCircle, Play, Wrench, XCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/axios";

import { MasterPageLayout, TableSkeleton, EmptyState, ConfirmDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MachineForm } from "./machine-form";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Machine = {
  id: string;
  serialNumber: string;
  brand: string;
  model: string;
  roomName: string | null;
  status: "available" | "in_use" | "maintenance" | "out_of_service";
  isActive: boolean;
};

const statusConfig: Record<string, { label: string; variant: "success" | "info" | "warning" | "destructive"; icon: typeof CheckCircle }> = {
  available: { label: "Tersedia", variant: "success", icon: CheckCircle },
  in_use: { label: "Digunakan", variant: "info", icon: Play },
  maintenance: { label: "Maintenance", variant: "warning", icon: Wrench },
  out_of_service: { label: "Tidak Aktif", variant: "destructive", icon: XCircle },
};

export default function MachinesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Machine | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["machines", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: "10" });
      if (search) params.append("search", search);
      const res = await api.get(`/api/master/machines?${params}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/master/machines/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      toast.success("Mesin berhasil dihapus");
      setDeletingId(null);
    },
    onError: () => toast.error("Gagal menghapus mesin"),
  });

  const columns: ColumnDef<Machine>[] = [
    {
      accessorKey: "serialNumber",
      header: "Mesin",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium font-mono">{row.getValue("serialNumber")}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.brand} {row.original.model}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "roomName",
      header: "Lokasi",
      cell: ({ row }) => {
        const room = row.getValue("roomName") as string | null;
        return room ? (
          <Badge variant="outline">{room}</Badge>
        ) : (
          <span className="text-muted-foreground">Belum ditempatkan</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const config = statusConfig[status] || { label: status, variant: "secondary" as const, icon: CheckCircle };
        const Icon = config.icon;
        return (
          <Badge variant={config.variant} className="gap-1">
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setEditingItem(row.original);
                    setIsFormOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setDeletingId(row.original.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Hapus</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  const stats = data?.meta ? [
    {
      label: "Total Mesin",
      value: data.meta.total || 0,
      icon: Cpu,
      color: "default" as const,
    },
    {
      label: "Tersedia",
      value: data.data?.filter((m: Machine) => m.status === "available").length || 0,
      icon: CheckCircle,
      color: "success" as const,
    },
    {
      label: "Digunakan",
      value: data.data?.filter((m: Machine) => m.status === "in_use").length || 0,
      icon: Play,
      color: "warning" as const,
    },
    {
      label: "Maintenance",
      value: data.data?.filter((m: Machine) => m.status === "maintenance" || m.status === "out_of_service").length || 0,
      icon: Wrench,
      color: "danger" as const,
    },
  ] : undefined;

  return (
    <>
      <MasterPageLayout
        title="Mesin Hemodialisis"
        description="Kelola data mesin hemodialisis"
        icon={Cpu}
        stats={stats}
        searchPlaceholder="Cari nomor seri, merek, atau model..."
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        addButtonLabel="Tambah Mesin"
        onAddClick={() => setIsFormOpen(true)}
      >
        {isLoading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : error ? (
          <EmptyState title="Gagal memuat data" />
        ) : data?.data?.length === 0 ? (
          <EmptyState
            title="Belum ada mesin"
            description="Mulai dengan menambahkan mesin baru"
          />
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
          if (!open) setEditingItem(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Mesin" : "Tambah Mesin"}</DialogTitle>
          </DialogHeader>
          <MachineForm
            machine={editingItem}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingItem(null);
              queryClient.invalidateQueries({ queryKey: ["machines"] });
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus Mesin"
        description="Apakah Anda yakin ingin menghapus mesin ini?"
        confirmLabel="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </>
  );
}
