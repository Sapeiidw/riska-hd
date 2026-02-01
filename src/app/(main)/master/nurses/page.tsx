"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, HeartPulse, UserCheck, UserX, AlertCircle, Award } from "lucide-react";
import { toast } from "sonner";
import { format, isBefore, addMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";

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
import { NurseForm } from "./nurse-form";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Nurse = {
  id: string;
  userId: string;
  name: string;
  email: string;
  nip: string | null;
  sip: string | null;
  certification: string | null;
  certificationExpiry: string | null;
  isActive: boolean;
};

async function fetchNurses(page: number, search: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "10",
    ...(search && { search }),
  });
  const res = await fetch(`/api/master/nurses?${params}`);
  if (!res.ok) throw new Error("Failed to fetch nurses");
  return res.json();
}

async function deleteNurse(id: string) {
  const res = await fetch(`/api/master/nurses/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete nurse");
  return res.json();
}

export default function NursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNurse, setEditingNurse] = useState<Nurse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["nurses", page, search],
    queryFn: () => fetchNurses(page, search),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNurse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nurses"] });
      toast.success("Perawat berhasil dihapus");
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Gagal menghapus perawat");
    },
  });

  const columns: ColumnDef<Nurse>[] = [
    {
      accessorKey: "name",
      header: "Perawat",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "certification",
      header: "Sertifikasi",
      cell: ({ row }) => {
        const cert = row.getValue("certification") as string | null;
        const certExpiry = row.original.certificationExpiry;

        if (!cert) return <span className="text-muted-foreground">-</span>;

        const isExpired = certExpiry && isBefore(new Date(certExpiry), new Date());
        const isExpiringSoon = certExpiry && isBefore(new Date(certExpiry), addMonths(new Date(), 3)) && !isExpired;

        return (
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="w-fit">
              <Award className="mr-1 h-3 w-3" />
              {cert}
            </Badge>
            {certExpiry && (
              <span className={`text-xs ${isExpired ? "text-destructive" : isExpiringSoon ? "text-amber-600" : "text-muted-foreground"}`}>
                {isExpired ? "Expired: " : isExpiringSoon ? "Exp: " : "s/d "}
                {format(new Date(certExpiry), "dd MMM yyyy", { locale: localeId })}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "sip",
      header: "SIP",
      cell: ({ row }) => {
        const sip = row.getValue("sip") as string | null;
        return sip ? (
          <span className="font-mono text-sm">{sip}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "nip",
      header: "NIP",
      cell: ({ row }) => {
        const nip = row.getValue("nip") as string | null;
        return nip ? (
          <span className="font-mono text-sm">{nip}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
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
                    setEditingNurse(row.original);
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

  const certExpiringSoon = data?.data?.filter((n: Nurse) => {
    if (!n.certificationExpiry) return false;
    const expiry = new Date(n.certificationExpiry);
    return isBefore(expiry, addMonths(new Date(), 3)) && !isBefore(expiry, new Date());
  }).length || 0;

  const certExpired = data?.data?.filter((n: Nurse) => {
    if (!n.certificationExpiry) return false;
    return isBefore(new Date(n.certificationExpiry), new Date());
  }).length || 0;

  const stats = data?.meta ? [
    {
      label: "Total Perawat",
      value: data.meta.total || 0,
      icon: HeartPulse,
      color: "default" as const,
    },
    {
      label: "Aktif",
      value: data.data?.filter((n: Nurse) => n.isActive).length || 0,
      icon: UserCheck,
      color: "success" as const,
    },
    {
      label: "Sertifikasi Segera Habis",
      value: certExpiringSoon,
      icon: AlertCircle,
      color: "warning" as const,
    },
    {
      label: "Sertifikasi Kadaluarsa",
      value: certExpired,
      icon: UserX,
      color: "danger" as const,
    },
  ] : undefined;

  return (
    <>
      <MasterPageLayout
        title="Daftar Perawat"
        description="Kelola data perawat hemodialisis"
        icon={HeartPulse}
        stats={stats}
        searchPlaceholder="Cari nama, email, NIP, atau SIP..."
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        addButtonLabel="Tambah Perawat"
        onAddClick={() => setIsFormOpen(true)}
      >
        {isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : error ? (
          <EmptyState
            title="Gagal memuat data"
            description="Terjadi kesalahan saat memuat data perawat"
          />
        ) : data?.data?.length === 0 ? (
          <EmptyState
            title="Belum ada perawat"
            description="Mulai dengan menambahkan perawat baru"
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
          if (!open) setEditingNurse(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingNurse ? "Edit Perawat" : "Tambah Perawat"}
            </DialogTitle>
          </DialogHeader>
          <NurseForm
            nurse={editingNurse}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingNurse(null);
              queryClient.invalidateQueries({ queryKey: ["nurses"] });
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus Perawat"
        description="Apakah Anda yakin ingin menghapus perawat ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </>
  );
}
