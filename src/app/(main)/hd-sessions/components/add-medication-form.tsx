"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";

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

const addMedicationSchema = z.object({
  medicationId: z.string().min(1, "Obat wajib dipilih"),
  dosage: z.string().min(1, "Dosis wajib diisi"),
  route: z.string().min(1, "Rute pemberian wajib diisi"),
  notes: z.string().optional(),
});

type AddMedicationFormData = z.infer<typeof addMedicationSchema>;

async function fetchMedications() {
  const res = await fetch("/api/master/medications?limit=100");
  if (!res.ok) throw new Error("Failed to fetch medications");
  return res.json();
}

async function addMedication(sessionId: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/hd-sessions/${sessionId}/medications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Failed to add medication");
  }
  return res.json();
}

export function AddMedicationForm({
  sessionId,
  onSuccess,
}: {
  sessionId: string;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddMedicationFormData>({
    resolver: zodResolver(addMedicationSchema),
    defaultValues: {
      route: "iv",
    },
  });

  const { data: medicationsData } = useQuery({
    queryKey: ["medications-all"],
    queryFn: fetchMedications,
  });

  const addMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => addMedication(sessionId, data),
    onSuccess,
    onError: (error: Error) => {
      alert(error.message || "Gagal menambahkan obat");
    },
  });

  const selectedMedicationId = watch("medicationId");
  const selectedMedication = medicationsData?.data?.find(
    (m: { id: string }) => m.id === selectedMedicationId
  );

  const onSubmit = (data: AddMedicationFormData) => {
    const medicationData = {
      medicationId: data.medicationId,
      dosage: data.dosage,
      route: data.route,
      administeredAt: new Date().toISOString(),
      notes: data.notes || null,
    };

    addMutation.mutate(medicationData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="medicationId">Obat *</Label>
        <Select
          value={watch("medicationId") || ""}
          onValueChange={(v) => {
            setValue("medicationId", v);
            // Auto-fill dosage if available
            const med = medicationsData?.data?.find((m: { id: string }) => m.id === v);
            if (med?.defaultDosage) {
              setValue("dosage", med.defaultDosage);
            }
            if (med?.route) {
              setValue("route", med.route);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih obat..." />
          </SelectTrigger>
          <SelectContent>
            {medicationsData?.data?.map(
              (med: {
                id: string;
                name: string;
                genericName: string | null;
                unit: string;
              }) => (
                <SelectItem key={med.id} value={med.id}>
                  {med.name} {med.genericName ? `(${med.genericName})` : ""} - {med.unit}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        {errors.medicationId && (
          <p className="text-sm text-destructive">{errors.medicationId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dosage">Dosis *</Label>
          <Input
            id="dosage"
            placeholder={selectedMedication?.defaultDosage || "Contoh: 1000 IU"}
            {...register("dosage")}
          />
          {errors.dosage && (
            <p className="text-sm text-destructive">{errors.dosage.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="route">Rute Pemberian *</Label>
          <Select
            value={watch("route") || ""}
            onValueChange={(v) => setValue("route", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih rute..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="iv">IV (Intravena)</SelectItem>
              <SelectItem value="sc">SC (Subkutan)</SelectItem>
              <SelectItem value="im">IM (Intramuskular)</SelectItem>
              <SelectItem value="oral">Oral</SelectItem>
              <SelectItem value="sl">Sublingual</SelectItem>
              <SelectItem value="intradialitic">Intradialitik</SelectItem>
            </SelectContent>
          </Select>
          {errors.route && (
            <p className="text-sm text-destructive">{errors.route.message}</p>
          )}
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

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={addMutation.isPending}>
          {addMutation.isPending ? "Menyimpan..." : "Simpan Obat"}
        </Button>
      </div>
    </form>
  );
}
