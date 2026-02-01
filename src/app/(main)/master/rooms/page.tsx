"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, DoorOpen, CheckCircle, XCircle, Bed, Building } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/axios";

import { MasterPageLayout, TableSkeleton } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoomForm } from "./room-form";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Room = {
  id: string;
  name: string;
  code: string;
  floor: string | null;
  capacity: number;
  description: string | null;
  isActive: boolean;
};

async function fetchRooms(page: number, search: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "10",
    ...(search && { search }),
  });
  const res = await api.get(`/api/master/rooms?${params}`);
  return res.data;
}

async function deleteRoom(id: string) {
  const res = await api.delete(`/api/master/rooms/${id}`);
  return res.data;
}

export default function RoomsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["rooms", page, search],
    queryFn: () => fetchRooms(page, search),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Ruangan berhasil dihapus");
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Gagal menghapus ruangan");
    },
  });

  const columns: ColumnDef<Room>[] = [
    {
      accessorKey: "name",
      header: "Ruangan",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          <span className="text-xs text-muted-foreground font-mono">{row.original.code}</span>
        </div>
      ),
    },
    {
      accessorKey: "floor",
      header: "Lantai",
      cell: ({ row }) => {
        const floor = row.getValue("floor") as string | null;
        return floor ? (
          <Badge variant="outline">
            <Building className="mr-1 h-3 w-3" />
            Lantai {floor}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "capacity",
      header: "Kapasitas",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Bed className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("capacity")}</span>
          <span className="text-muted-foreground">bed</span>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        row.getValue("isActive") ? (
          <Badge variant="success">
            <CheckCircle className="mr-1 h-3 w-3" />
            Aktif
          </Badge>
        ) : (
          <Badge variant="secondary">
            <XCircle className="mr-1 h-3 w-3" />
            Nonaktif
          </Badge>
        )
      ),
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
                    setEditingRoom(row.original);
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

  const totalCapacity = data?.data?.reduce((acc: number, room: Room) => acc + room.capacity, 0) || 0;

  const stats = data?.meta ? [
    {
      label: "Total Ruangan",
      value: data.meta.total || 0,
      icon: DoorOpen,
      color: "default" as const,
    },
    {
      label: "Aktif",
      value: data.data?.filter((r: Room) => r.isActive).length || 0,
      icon: CheckCircle,
      color: "success" as const,
    },
    {
      label: "Nonaktif",
      value: data.data?.filter((r: Room) => !r.isActive).length || 0,
      icon: XCircle,
      color: "warning" as const,
    },
    {
      label: "Total Kapasitas",
      value: `${totalCapacity} bed`,
      icon: Bed,
      color: "default" as const,
    },
  ] : undefined;

  return (
    <>
      <MasterPageLayout
        title="Ruangan Hemodialisis"
        description="Kelola data ruangan HD"
        icon={DoorOpen}
        stats={stats}
        searchPlaceholder="Cari nama atau kode ruangan..."
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        addButtonLabel="Tambah Ruangan"
        onAddClick={() => setIsFormOpen(true)}
      >
        {isLoading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : error ? (
          <EmptyState
            title="Gagal memuat data"
            description="Terjadi kesalahan saat memuat data ruangan"
          />
        ) : data?.data?.length === 0 ? (
          <EmptyState
            title="Belum ada ruangan"
            description="Mulai dengan menambahkan ruangan baru"
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
          if (!open) setEditingRoom(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? "Edit Ruangan" : "Tambah Ruangan"}
            </DialogTitle>
          </DialogHeader>
          <RoomForm
            room={editingRoom}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingRoom(null);
              queryClient.invalidateQueries({ queryKey: ["rooms"] });
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus Ruangan"
        description="Apakah Anda yakin ingin menghapus ruangan ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </>
  );
}
