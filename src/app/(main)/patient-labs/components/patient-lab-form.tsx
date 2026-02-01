"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const labFormSchema = z.object({
  patientId: z.string().min(1, "Pasien wajib dipilih"),
  testDate: z.string().min(1, "Tanggal tes wajib diisi"),
  reportDate: z.string().optional(),
  hemoglobin: z.string().optional(),
  ureum: z.string().optional(),
  creatinine: z.string().optional(),
  potassium: z.string().optional(),
  sodium: z.string().optional(),
  calcium: z.string().optional(),
  phosphorus: z.string().optional(),
  albumin: z.string().optional(),
  uricAcid: z.string().optional(),
  ktv: z.string().optional(),
  urr: z.string().optional(),
  labSource: z.string().optional(),
  notes: z.string().optional(),
});

type LabFormData = z.infer<typeof labFormSchema>;

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
};

async function fetchPatients() {
  const res = await fetch("/api/master/patients?limit=500");
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
}

async function createLab(data: Record<string, unknown>) {
  const res = await fetch("/api/patient-labs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Failed to create lab");
  }
  return res.json();
}

async function updateLab(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/patient-labs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Failed to update lab");
  }
  return res.json();
}

export function PatientLabForm({
  lab,
  onSuccess,
}: {
  lab: PatientLab | null;
  onSuccess: () => void;
}) {
  const isEditing = !!lab;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LabFormData>({
    resolver: zodResolver(labFormSchema),
    defaultValues: lab
      ? {
          patientId: lab.patientId,
          testDate: format(new Date(lab.testDate), "yyyy-MM-dd"),
          reportDate: lab.reportDate ? format(new Date(lab.reportDate), "yyyy-MM-dd") : "",
          hemoglobin: lab.hemoglobin ? (lab.hemoglobin / 10).toString() : "",
          ureum: lab.ureum ? lab.ureum.toString() : "",
          creatinine: lab.creatinine ? (lab.creatinine / 10).toString() : "",
          potassium: lab.potassium ? (lab.potassium / 10).toString() : "",
          sodium: lab.sodium ? lab.sodium.toString() : "",
          calcium: lab.calcium ? (lab.calcium / 10).toString() : "",
          phosphorus: lab.phosphorus ? (lab.phosphorus / 10).toString() : "",
          albumin: lab.albumin ? (lab.albumin / 10).toString() : "",
          uricAcid: lab.uricAcid ? (lab.uricAcid / 10).toString() : "",
          ktv: lab.ktv ? (lab.ktv / 100).toString() : "",
          urr: lab.urr ? (lab.urr / 10).toString() : "",
          labSource: lab.labSource || "",
          notes: lab.notes || "",
        }
      : {
          testDate: format(new Date(), "yyyy-MM-dd"),
        },
  });

  const { data: patientsData } = useQuery({
    queryKey: ["patients-all"],
    queryFn: fetchPatients,
  });

  const createMutation = useMutation({
    mutationFn: createLab,
    onSuccess: () => {
      toast.success("Hasil lab berhasil disimpan");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menyimpan hasil lab");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => updateLab(lab!.id, data),
    onSuccess: () => {
      toast.success("Hasil lab berhasil diupdate");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengupdate hasil lab");
    },
  });

  const onSubmit = (data: LabFormData) => {
    const labData = {
      patientId: data.patientId,
      testDate: data.testDate,
      reportDate: data.reportDate || null,
      hemoglobin: data.hemoglobin ? Math.round(parseFloat(data.hemoglobin) * 10) : null,
      ureum: data.ureum ? parseInt(data.ureum) : null,
      creatinine: data.creatinine ? Math.round(parseFloat(data.creatinine) * 10) : null,
      potassium: data.potassium ? Math.round(parseFloat(data.potassium) * 10) : null,
      sodium: data.sodium ? parseInt(data.sodium) : null,
      calcium: data.calcium ? Math.round(parseFloat(data.calcium) * 10) : null,
      phosphorus: data.phosphorus ? Math.round(parseFloat(data.phosphorus) * 10) : null,
      albumin: data.albumin ? Math.round(parseFloat(data.albumin) * 10) : null,
      uricAcid: data.uricAcid ? Math.round(parseFloat(data.uricAcid) * 10) : null,
      ktv: data.ktv ? Math.round(parseFloat(data.ktv) * 100) : null,
      urr: data.urr ? Math.round(parseFloat(data.urr) * 10) : null,
      labSource: data.labSource || null,
      notes: data.notes || null,
    };

    if (isEditing) {
      updateMutation.mutate(labData);
    } else {
      createMutation.mutate(labData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientId">Pasien *</Label>
          <Select
            value={watch("patientId") || ""}
            onValueChange={(v) => setValue("patientId", v)}
            disabled={isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih pasien..." />
            </SelectTrigger>
            <SelectContent>
              {patientsData?.data?.map(
                (patient: { id: string; name: string; medicalRecordNumber: string }) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} ({patient.medicalRecordNumber})
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          {errors.patientId && (
            <p className="text-sm text-destructive">{errors.patientId.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="testDate">Tanggal Tes *</Label>
          <Input type="date" {...register("testDate")} />
          {errors.testDate && (
            <p className="text-sm text-destructive">{errors.testDate.message}</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Lab Values */}
      <div className="space-y-4">
        <h3 className="font-semibold">Nilai Laboratorium</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
            <Input
              id="hemoglobin"
              type="number"
              step="0.1"
              placeholder="12.5"
              {...register("hemoglobin")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ureum">Ureum (mg/dL)</Label>
            <Input
              id="ureum"
              type="number"
              placeholder="120"
              {...register("ureum")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="creatinine">Kreatinin (mg/dL)</Label>
            <Input
              id="creatinine"
              type="number"
              step="0.1"
              placeholder="8.5"
              {...register("creatinine")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="potassium">Kalium (mEq/L)</Label>
            <Input
              id="potassium"
              type="number"
              step="0.1"
              placeholder="4.5"
              {...register("potassium")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sodium">Natrium (mEq/L)</Label>
            <Input
              id="sodium"
              type="number"
              placeholder="140"
              {...register("sodium")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calcium">Kalsium (mg/dL)</Label>
            <Input
              id="calcium"
              type="number"
              step="0.1"
              placeholder="9.5"
              {...register("calcium")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phosphorus">Fosfor (mg/dL)</Label>
            <Input
              id="phosphorus"
              type="number"
              step="0.1"
              placeholder="5.5"
              {...register("phosphorus")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="albumin">Albumin (g/dL)</Label>
            <Input
              id="albumin"
              type="number"
              step="0.1"
              placeholder="3.5"
              {...register("albumin")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uricAcid">Asam Urat (mg/dL)</Label>
            <Input
              id="uricAcid"
              type="number"
              step="0.1"
              placeholder="7.0"
              {...register("uricAcid")}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Dialysis Adequacy */}
      <div className="space-y-4">
        <h3 className="font-semibold">Adekuasi Dialisis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ktv">Kt/V</Label>
            <Input
              id="ktv"
              type="number"
              step="0.01"
              placeholder="1.45"
              {...register("ktv")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="urr">URR (%)</Label>
            <Input
              id="urr"
              type="number"
              step="0.1"
              placeholder="75.0"
              {...register("urr")}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Additional Info */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="labSource">Sumber Lab</Label>
            <Input
              id="labSource"
              placeholder="Contoh: RS ABC, Lab XYZ"
              {...register("labSource")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reportDate">Tanggal Laporan</Label>
            <Input type="date" {...register("reportDate")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Catatan</Label>
          <Textarea
            id="notes"
            placeholder="Catatan tambahan..."
            {...register("notes")}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : isEditing ? "Update" : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
