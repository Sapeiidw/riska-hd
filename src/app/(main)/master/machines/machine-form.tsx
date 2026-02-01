"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createHdMachineSchema, CreateHdMachineInput } from "@/lib/validations/facility";

interface MachineFormProps {
  machine?: Partial<CreateHdMachineInput> & { id: string } | null;
  onSuccess: () => void;
}

export function MachineForm({ machine, onSuccess }: MachineFormProps) {
  const { data: roomsData } = useQuery({
    queryKey: ["rooms-select"],
    queryFn: async () => {
      const res = await fetch("/api/master/rooms?limit=100");
      if (!res.ok) throw new Error("Failed to fetch rooms");
      return res.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(createHdMachineSchema),
    defaultValues: {
      serialNumber: machine?.serialNumber || "",
      brand: machine?.brand || "",
      model: machine?.model || "",
      roomId: machine?.roomId || null,
      status: machine?.status || "available",
      notes: machine?.notes || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: unknown) => {
      const url = machine ? `/api/master/machines/${machine.id}` : "/api/master/machines";
      const res = await fetch(url, { method: machine ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { toast.success(machine ? "Mesin berhasil diperbarui" : "Mesin berhasil ditambahkan"); onSuccess(); },
    onError: () => toast.error("Gagal menyimpan mesin"),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <FormField control={form.control} name="serialNumber" render={({ field }) => (
          <FormItem><FormLabel>Nomor Seri</FormLabel><FormControl><Input placeholder="Contoh: HD-2024-001" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="brand" render={({ field }) => (
            <FormItem><FormLabel>Merek</FormLabel><FormControl><Input placeholder="Contoh: Fresenius" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="model" render={({ field }) => (
            <FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="Contoh: 4008S" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="roomId" render={({ field }) => (
            <FormItem>
              <FormLabel>Ruangan</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Pilih ruangan" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roomsData?.data?.map((room: { id: string; name: string }) => (
                    <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="available">Tersedia</SelectItem>
                  <SelectItem value="in_use">Digunakan</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="out_of_service">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem><FormLabel>Catatan (opsional)</FormLabel><FormControl><Textarea placeholder="Catatan tambahan" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Menyimpan..." : machine ? "Perbarui" : "Simpan"}</Button>
        </div>
      </form>
    </Form>
  );
}
