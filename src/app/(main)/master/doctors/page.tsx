"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, Stethoscope, UserCheck, UserX, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format, isBefore, addMonths } from "date-fns";
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
import { DoctorForm } from "./doctor-form";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Doctor = {
  id: string;
  userId: string;
  name: string;
  email: string;
  nip: string | null;
  sip: string | null;
  specialization: string | null;
  licenseExpiry: string | null;
  isActive: boolean;
};

async function fetchDoctors(page: number, search: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "10",
    ...(search && { search }),
  });
  const res = await api.get(`/api/master/doctors?${params}`);
  return res.data;
}

async function deleteDoctor(id: string) {
  const res = await api.delete(`/api/master/doctors/${id}`);
  return res.data;
}

export default function DoctorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["doctors", page, search],
    queryFn: () => fetchDoctors(page, search),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Dokter berhasil dihapus");
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Gagal menghapus dokter");
    },
  });

  const columns: ColumnDef<Doctor>[] = [
    {
      accessorKey: "name",
      header: "Dokter",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "specialization",
      header: "Spesialisasi",
      cell: ({ row }) => {
        const spec = row.getValue("specialization") as string | null;
        return spec ? (
          <Badge variant="outline">{spec}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "sip",
      header: "SIP",
      cell: ({ row }) => {
        const sip = row.getValue("sip") as string | null;
        const licenseExpiry = row.original.licenseExpiry;

        if (!sip) return <span className="text-muted-foreground">-</span>;

        const isExpired = licenseExpiry && isBefore(new Date(licenseExpiry), new Date());
        const isExpiringSoon = licenseExpiry && isBefore(new Date(licenseExpiry), addMonths(new Date(), 3)) && !isExpired;

        return (
          <div className="flex flex-col gap-1">
            <span className="font-mono text-sm">{sip}</span>
            {licenseExpiry && (
              <span className={`text-xs ${isExpired ? "text-destructive" : isExpiringSoon ? "text-amber-600" : "text-muted-foreground"}`}>
                {isExpired ? "Expired: " : isExpiringSoon ? "Exp: " : "s/d "}
                {format(new Date(licenseExpiry), "dd MMM yyyy", { locale: localeId })}
              </span>
            )}
          </div>
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
                    setEditingDoctor(row.original);
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

  const expiringSoon = data?.data?.filter((d: Doctor) => {
    if (!d.licenseExpiry) return false;
    const expiry = new Date(d.licenseExpiry);
    return isBefore(expiry, addMonths(new Date(), 3)) && !isBefore(expiry, new Date());
  }).length || 0;

  const expired = data?.data?.filter((d: Doctor) => {
    if (!d.licenseExpiry) return false;
    return isBefore(new Date(d.licenseExpiry), new Date());
  }).length || 0;

  const stats = data?.meta ? [
    {
      label: "Total Dokter",
      value: data.meta.total || 0,
      icon: Stethoscope,
      color: "default" as const,
    },
    {
      label: "Aktif",
      value: data.data?.filter((d: Doctor) => d.isActive).length || 0,
      icon: UserCheck,
      color: "success" as const,
    },
    {
      label: "SIP Segera Habis",
      value: expiringSoon,
      icon: AlertCircle,
      color: "warning" as const,
    },
    {
      label: "SIP Kadaluarsa",
      value: expired,
      icon: UserX,
      color: "danger" as const,
    },
  ] : undefined;

  return (
    <>
      <MasterPageLayout
        title="Daftar Dokter"
        description="Kelola data dokter hemodialisis"
        icon={Stethoscope}
        stats={stats}
        searchPlaceholder="Cari nama, email, NIP, atau SIP..."
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        addButtonLabel="Tambah Dokter"
        onAddClick={() => setIsFormOpen(true)}
      >
        {isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : error ? (
          <EmptyState
            title="Gagal memuat data"
            description="Terjadi kesalahan saat memuat data dokter"
          />
        ) : data?.data?.length === 0 ? (
          <EmptyState
            title="Belum ada dokter"
            description="Mulai dengan menambahkan dokter baru"
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
          if (!open) setEditingDoctor(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDoctor ? "Edit Dokter" : "Tambah Dokter"}
            </DialogTitle>
          </DialogHeader>
          <DoctorForm
            doctor={editingDoctor}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingDoctor(null);
              queryClient.invalidateQueries({ queryKey: ["doctors"] });
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus Dokter"
        description="Apakah Anda yakin ingin menghapus dokter ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </>
  );
}
