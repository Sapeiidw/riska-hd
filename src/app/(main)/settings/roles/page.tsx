"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, Shield, Eye, Key, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
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
import { RoleForm } from "./role-form";
import { RoleDetail } from "./role-detail";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Role = {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  permissionCount: number;
  createdAt: string;
};

async function fetchRoles(page: number, search: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "10",
    ...(search && { search }),
  });
  const res = await api.get(`/api/settings/roles?${params}`);
  return res.data;
}

async function deleteRole(id: string) {
  const res = await api.delete(`/api/settings/roles/${id}`);
  return res.data;
}

export default function RolesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewingRoleId, setViewingRoleId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["roles", page, search],
    queryFn: () => fetchRoles(page, search),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role berhasil dihapus");
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Gagal menghapus role");
    },
  });

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "displayName",
      header: "Role",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-medium">{row.getValue("displayName")}</span>
          </div>
          <span className="text-xs text-muted-foreground ml-6 font-mono">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm line-clamp-2">
          {row.getValue("description") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "permissionCount",
      header: "Permissions",
      cell: ({ row }) => {
        const count = row.getValue("permissionCount") as number | undefined;
        return (
          <Badge variant="secondary" className="gap-1">
            <Key className="h-3 w-3" />
            {count ?? 0} akses
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Dibuat",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(date), "dd MMM yyyy", { locale: localeId })}
          </span>
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
                    setViewingRoleId(row.original.id);
                    setIsDetailOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lihat Detail</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setEditingRole(row.original);
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

  const totalPermissions = data?.data?.reduce((acc: number, role: Role) => acc + (role.permissionCount || 0), 0) || 0;

  const stats = data?.meta ? [
    {
      label: "Total Role",
      value: data.meta.total || 0,
      icon: Shield,
      color: "default" as const,
    },
    {
      label: "Total Permissions",
      value: totalPermissions,
      icon: Key,
      color: "success" as const,
    },
    {
      label: "Role Sistem",
      value: data.data?.filter((r: Role) => ["admin", "dokter", "perawat", "pasien"].includes(r.name)).length || 0,
      icon: Users,
      color: "warning" as const,
    },
    {
      label: "Role Kustom",
      value: data.data?.filter((r: Role) => !["admin", "dokter", "perawat", "pasien"].includes(r.name)).length || 0,
      icon: Shield,
      color: "default" as const,
    },
  ] : undefined;

  return (
    <>
      <MasterPageLayout
        title="Manajemen Role"
        description="Kelola role dan hak akses pengguna"
        icon={Shield}
        stats={stats}
        searchPlaceholder="Cari nama role..."
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        addButtonLabel="Tambah Role"
        onAddClick={() => setIsFormOpen(true)}
      >
        {isLoading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : error ? (
          <EmptyState
            title="Gagal memuat data"
            description="Terjadi kesalahan saat memuat data role"
          />
        ) : data?.data?.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="Belum ada role"
            description="Mulai dengan menambahkan role baru"
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
          if (!open) setEditingRole(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role" : "Tambah Role"}
            </DialogTitle>
          </DialogHeader>
          <RoleForm
            role={editingRole}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingRole(null);
              queryClient.invalidateQueries({ queryKey: ["roles"] });
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) setViewingRoleId(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Role</DialogTitle>
          </DialogHeader>
          {viewingRoleId && <RoleDetail roleId={viewingRoleId} />}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus Role"
        description="Apakah Anda yakin ingin menghapus role ini? Semua permissions yang terkait juga akan dihapus."
        confirmLabel="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </>
  );
}
