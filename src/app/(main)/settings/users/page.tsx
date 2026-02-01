"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, Users, UserCheck, UserX, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import api from "@/lib/api/axios";

import { MasterPageLayout, MasterPageSkeleton, TableSkeleton } from "@/components/shared";
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
import { UserForm } from "./user-form";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type User = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  emailVerified: boolean;
  createdAt: string;
};

const roleLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  admin: { label: "Admin", variant: "destructive" },
  dokter: { label: "Dokter", variant: "default" },
  perawat: { label: "Perawat", variant: "secondary" },
  pasien: { label: "Pasien", variant: "outline" },
  edukator: { label: "Edukator", variant: "outline" },
};

async function fetchUsers(page: number, search: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "10",
    ...(search && { search }),
  });
  const res = await api.get(`/api/settings/users?${params}`);
  return res.data;
}

async function deleteUser(id: string) {
  const res = await api.delete(`/api/settings/users/${id}`);
  return res.data;
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", page, search],
    queryFn: () => fetchUsers(page, search),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User berhasil dihapus");
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Gagal menghapus user");
    },
  });

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Nama",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string | null;
        if (!role) return <Badge variant="outline">-</Badge>;
        const roleInfo = roleLabels[role] || { label: role, variant: "outline" as const };
        return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
      },
    },
    {
      accessorKey: "emailVerified",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.getValue("emailVerified") ? (
            <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              <UserCheck className="mr-1 h-3 w-3" />
              Terverifikasi
            </Badge>
          ) : (
            <Badge variant="secondary">
              <UserX className="mr-1 h-3 w-3" />
              Belum Verifikasi
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Terdaftar",
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
                    setEditingUser(row.original);
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
      label: "Total User",
      value: data.meta.total || 0,
      icon: Users,
      color: "default" as const,
    },
    {
      label: "Terverifikasi",
      value: data.data?.filter((u: User) => u.emailVerified).length || 0,
      icon: UserCheck,
      color: "success" as const,
    },
    {
      label: "Belum Verifikasi",
      value: data.data?.filter((u: User) => !u.emailVerified).length || 0,
      icon: UserX,
      color: "warning" as const,
    },
    {
      label: "Admin",
      value: data.data?.filter((u: User) => u.role === "admin").length || 0,
      icon: ShieldCheck,
      color: "danger" as const,
    },
  ] : undefined;

  return (
    <>
      <MasterPageLayout
        title="Manajemen User"
        description="Kelola data pengguna sistem"
        icon={Users}
        stats={stats}
        searchPlaceholder="Cari nama atau email..."
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        addButtonLabel="Tambah User"
        onAddClick={() => setIsFormOpen(true)}
      >
        {isLoading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : error ? (
          <EmptyState
            title="Gagal memuat data"
            description="Terjadi kesalahan saat memuat data user"
          />
        ) : data?.data?.length === 0 ? (
          <EmptyState
            title="Belum ada user"
            description="Mulai dengan menambahkan user baru"
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
          if (!open) setEditingUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Tambah User"}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            user={editingUser}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingUser(null);
              queryClient.invalidateQueries({ queryKey: ["users"] });
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus User"
        description="Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </>
  );
}
