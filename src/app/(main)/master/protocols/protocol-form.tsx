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
import { createHdProtocolSchema, CreateHdProtocolInput } from "@/lib/validations/medical";

interface ProtocolFormProps {
  protocol?: Partial<CreateHdProtocolInput> & { id: string } | null;
  onSuccess: () => void;
}

export function ProtocolForm({ protocol, onSuccess }: ProtocolFormProps) {
  const form = useForm<CreateHdProtocolInput>({
    resolver: zodResolver(createHdProtocolSchema),
    defaultValues: {
      name: protocol?.name || "",
      dialyzerType: protocol?.dialyzerType || "",
      bloodFlowRate: protocol?.bloodFlowRate || undefined,
      dialysateFlowRate: protocol?.dialysateFlowRate || undefined,
      duration: protocol?.duration || undefined,
      ufGoal: protocol?.ufGoal || undefined,
      anticoagulant: protocol?.anticoagulant || "",
      anticoagulantDose: protocol?.anticoagulantDose || "",
      dialysateType: protocol?.dialysateType || "",
      notes: protocol?.notes || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateHdProtocolInput) => {
      const url = protocol ? `/api/master/protocols/${protocol.id}` : "/api/master/protocols";
      const res = protocol ? await api.put(url, data) : await api.post(url, data);
      return res.data;
    },
    onSuccess: () => { toast.success(protocol ? "Protokol berhasil diperbarui" : "Protokol berhasil ditambahkan"); onSuccess(); },
    onError: () => toast.error("Gagal menyimpan protokol"),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nama Protokol</FormLabel><FormControl><Input placeholder="Contoh: Standard HD" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="dialyzerType" render={({ field }) => (
            <FormItem><FormLabel>Tipe Dialyzer</FormLabel><FormControl><Input placeholder="Contoh: F60" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField control={form.control} name="bloodFlowRate" render={({ field }) => (
            <FormItem><FormLabel>Qb (ml/min)</FormLabel><FormControl><Input type="number" placeholder="200" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="dialysateFlowRate" render={({ field }) => (
            <FormItem><FormLabel>Qd (ml/min)</FormLabel><FormControl><Input type="number" placeholder="500" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="duration" render={({ field }) => (
            <FormItem><FormLabel>Durasi (menit)</FormLabel><FormControl><Input type="number" placeholder="240" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="ufGoal" render={({ field }) => (
            <FormItem><FormLabel>Target UF (ml)</FormLabel><FormControl><Input type="number" placeholder="2000" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="dialysateType" render={({ field }) => (
            <FormItem><FormLabel>Tipe Dialisat</FormLabel><FormControl><Input placeholder="Bicarbonate" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="anticoagulant" render={({ field }) => (
            <FormItem><FormLabel>Antikoagulan</FormLabel><FormControl><Input placeholder="Heparin" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="anticoagulantDose" render={({ field }) => (
            <FormItem><FormLabel>Dosis Antikoagulan</FormLabel><FormControl><Input placeholder="5000 IU" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem><FormLabel>Catatan (opsional)</FormLabel><FormControl><Textarea placeholder="Catatan tambahan" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Menyimpan..." : protocol ? "Perbarui" : "Simpan"}</Button>
        </div>
      </form>
    </Form>
  );
}
