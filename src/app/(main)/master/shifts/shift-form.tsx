"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api/axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createShiftSchema, CreateShiftInput } from "@/lib/validations/facility";

interface ShiftFormProps {
  shift?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    maxPatients: number | null;
  } | null;
  onSuccess: () => void;
}

export function ShiftForm({ shift, onSuccess }: ShiftFormProps) {
  const form = useForm<CreateShiftInput>({
    resolver: zodResolver(createShiftSchema),
    defaultValues: {
      name: shift?.name || "",
      startTime: shift?.startTime || "",
      endTime: shift?.endTime || "",
      maxPatients: shift?.maxPatients || undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateShiftInput) => {
      const url = shift
        ? `/api/master/shifts/${shift.id}`
        : "/api/master/shifts";
      const res = shift ? await api.put(url, data) : await api.post(url, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(shift ? "Shift berhasil diperbarui" : "Shift berhasil ditambahkan");
      onSuccess();
    },
    onError: () => {
      toast.error("Gagal menyimpan shift");
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Shift</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Shift 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jam Mulai</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jam Selesai</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="maxPatients"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maksimal Pasien (opsional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Menyimpan..." : shift ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
