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
import { createDiagnosisSchema, CreateDiagnosisInput } from "@/lib/validations/medical";

interface DiagnosisFormProps {
  diagnosis?: { id: string; icdCode: string | null; name: string; category: string | null; description: string | null } | null;
  onSuccess: () => void;
}

export function DiagnosisForm({ diagnosis, onSuccess }: DiagnosisFormProps) {
  const form = useForm<CreateDiagnosisInput>({
    resolver: zodResolver(createDiagnosisSchema),
    defaultValues: {
      icdCode: diagnosis?.icdCode || "",
      name: diagnosis?.name || "",
      category: diagnosis?.category || "",
      description: diagnosis?.description || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateDiagnosisInput) => {
      const url = diagnosis ? `/api/master/diagnoses/${diagnosis.id}` : "/api/master/diagnoses";
      const res = diagnosis ? await api.put(url, data) : await api.post(url, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(diagnosis ? "Diagnosa berhasil diperbarui" : "Diagnosa berhasil ditambahkan");
      onSuccess();
    },
    onError: () => toast.error("Gagal menyimpan diagnosa"),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <FormField control={form.control} name="icdCode" render={({ field }) => (
          <FormItem>
            <FormLabel>Kode ICD (opsional)</FormLabel>
            <FormControl><Input placeholder="Contoh: N18.5" {...field} value={field.value || ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Nama Diagnosa</FormLabel>
            <FormControl><Input placeholder="Contoh: CKD Stage 5" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="category" render={({ field }) => (
          <FormItem>
            <FormLabel>Kategori (opsional)</FormLabel>
            <FormControl><Input placeholder="Contoh: CKD" {...field} value={field.value || ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Deskripsi (opsional)</FormLabel>
            <FormControl><Textarea placeholder="Deskripsi diagnosa" {...field} value={field.value || ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Menyimpan..." : diagnosis ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
