"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FlaskConical, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PatientLabForm } from "./components/patient-lab-form";
import { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PatientLab = {
  id: string;
  patientId: string;
  testDate: string;
  reportDate: string | null;
  hemoglobin: number | null;
  ureum: number | null;
  creatinine: number | null;
  potassium: number | null;
  sodium: number | null;
  calcium: number | null;
  phosphorus: number | null;
  albumin: number | null;
  uricAcid: number | null;
  ktv: number | null;
  urr: number | null;
  labSource: string | null;
  notes: string | null;
  patientName: string;
  patientMrn: string;
  enteredByName: string | null;
};

async function fetchPatientLabs(params: URLSearchParams) {
  const res = await fetch(`/api/patient-labs?${params}`);
  if (!res.ok) throw new Error("Failed to fetch patient labs");
  return res.json();
}

async function fetchPatients() {
  const res = await fetch("/api/master/patients?limit=500");
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
}

async function deleteLab(id: string) {
  const res = await fetch(`/api/patient-labs/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete lab");
  return res.json();
}

export default function PatientLabsPage() {
  const [page, setPage] = useState(1);
  const [patientFilter, setPatientFilter] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<PatientLab | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (patientFilter) params.set("patientId", patientFilter);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const { data: patientsData } = useQuery({
    queryKey: ["patients-all"],
    queryFn: fetchPatients,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["patient-labs", page, patientFilter, startDate, endDate],
    queryFn: () => fetchPatientLabs(params),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLab,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-labs"] });
      toast.success("Data lab berhasil dihapus");
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Gagal menghapus data lab");
    },
  });

  const formatLabValue = (value: number | null, multiplier: number = 10) => {
    if (value === null) return "-";
    return (value / multiplier).toFixed(1);
  };

  const columns: ColumnDef<PatientLab>[] = [
    {
      accessorKey: "testDate",
      header: "Tanggal Tes",
      cell: ({ row }) => (
        <span className="font-medium">
          {format(new Date(row.getValue("testDate")), "dd MMM yyyy", { locale: localeId })}
        </span>
      ),
    },
    {
      accessorKey: "patientName",
      header: "Pasien",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("patientName")}</span>
          <span className="text-xs text-muted-foreground">MRN: {row.original.patientMrn}</span>
        </div>
      ),
    },
    {
      accessorKey: "hemoglobin",
      header: "Hb (g/dL)",
      cell: ({ row }) => formatLabValue(row.getValue("hemoglobin")),
    },
    {
      accessorKey: "ureum",
      header: "Ureum",
      cell: ({ row }) => {
        const value = row.getValue("ureum") as number | null;
        return value !== null ? value : "-";
      },
    },
    {
      accessorKey: "creatinine",
      header: "Kreatinin",
      cell: ({ row }) => formatLabValue(row.getValue("creatinine")),
    },
    {
      accessorKey: "ktv",
      header: "Kt/V",
      cell: ({ row }) => formatLabValue(row.getValue("ktv"), 100),
    },
    {
      accessorKey: "urr",
      header: "URR (%)",
      cell: ({ row }) => formatLabValue(row.getValue("urr")),
    },
    {
      accessorKey: "labSource",
      header: "Sumber",
      cell: ({ row }) => row.getValue("labSource") || "-",
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
                    setEditingLab(row.original);
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

  return (
    <>
      <MasterPageLayout
        title="Hasil Lab Pasien"
        description="Kelola hasil laboratorium pasien hemodialisa"
        icon={FlaskConical}
        addButtonLabel="Tambah Hasil Lab"
        onAddClick={() => {
          setEditingLab(null);
          setIsFormOpen(true);
        }}
      >
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>Pasien</Label>
            <Select
              value={patientFilter || "_all"}
              onValueChange={(v) => {
                setPatientFilter(v === "_all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Semua Pasien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Semua Pasien</SelectItem>
                {patientsData?.data?.map((patient: { id: string; name: string; medicalRecordNumber: string }) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} ({patient.medicalRecordNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Dari Tanggal</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-[180px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Sampai Tanggal</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-[180px]"
            />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <EmptyState
            title="Gagal memuat data"
            description="Terjadi kesalahan saat memuat data lab"
          />
        ) : data?.data?.length === 0 ? (
          <EmptyState
            title="Belum ada data lab"
            description="Mulai dengan menambahkan hasil lab pasien"
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

      {/* Form Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingLab(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLab ? "Edit Hasil Lab" : "Tambah Hasil Lab"}
            </DialogTitle>
          </DialogHeader>
          <PatientLabForm
            lab={editingLab}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingLab(null);
              queryClient.invalidateQueries({ queryKey: ["patient-labs"] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus Hasil Lab"
        description="Apakah Anda yakin ingin menghapus hasil lab ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
      />
    </>
  );
}
