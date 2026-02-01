"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api/axios";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createMedicationSchema, CreateMedicationInput } from "@/lib/validations/medical";

interface MedicationFormProps {
  medication?: { id: string; name: string; genericName: string | null; category: string | null; unit: string; defaultDosage: string | null; route: string | null; notes: string | null } | null;
  onSuccess: () => void;
}

export function MedicationForm({ medication, onSuccess }: MedicationFormProps) {
  const form = useForm<CreateMedicationInput>({
    resolver: zodResolver(createMedicationSchema),
    defaultValues: {
      name: medication?.name || "",
      genericName: medication?.genericName || "",
      category: medication?.category || "",
      unit: medication?.unit || "",
      defaultDosage: medication?.defaultDosage || "",
      route: medication?.route || "",
      notes: medication?.notes || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateMedicationInput) => {
      const url = medication ? `/api/master/medications/${medication.id}` : "/api/master/medications";
      const res = medication ? await api.put(url, data) : await api.post(url, data);
      return res.data;
    },
    onSuccess: () => { toast.success(medication ? "Obat berhasil diperbarui" : "Obat berhasil ditambahkan"); onSuccess(); },
    onError: () => toast.error("Gagal menyimpan obat"),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Nama Obat</FormLabel><FormControl><Input placeholder="Contoh: Erythropoietin" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <FormField control={form.control} name="genericName" render={({ field }) => (
          <FormItem><FormLabel>Nama Generik (opsional)</FormLabel><FormControl><Input placeholder="Nama generik obat" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem><FormLabel>Kategori</FormLabel><FormControl><Input placeholder="Contoh: EPO" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="unit" render={({ field }) => (
            <FormItem><FormLabel>Satuan</FormLabel><FormControl><Input placeholder="Contoh: IU" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="defaultDosage" render={({ field }) => (
            <FormItem><FormLabel>Dosis Default</FormLabel><FormControl><Input placeholder="Contoh: 3000" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="route" render={({ field }) => (
            <FormItem><FormLabel>Rute</FormLabel><FormControl><Input placeholder="Contoh: IV, SC" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem><FormLabel>Catatan (opsional)</FormLabel><FormControl><Textarea placeholder="Catatan tambahan" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Menyimpan..." : medication ? "Perbarui" : "Simpan"}</Button>
        </div>
      </form>
    </Form>
  );
}
