"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

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
import { createNurseSchema, CreateNurseInput } from "@/lib/validations/staff";

interface NurseFormProps {
  nurse?: {
    id: string;
    name: string;
    email: string;
    nip: string | null;
    sip: string | null;
    certification: string | null;
    certificationExpiry: string | null;
  } | null;
  onSuccess: () => void;
}

async function createNurse(data: CreateNurseInput) {
  const res = await fetch("/api/master/nurses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create nurse");
  return res.json();
}

async function updateNurse(id: string, data: Partial<CreateNurseInput>) {
  const res = await fetch(`/api/master/nurses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update nurse");
  return res.json();
}

export function NurseForm({ nurse, onSuccess }: NurseFormProps) {
  const form = useForm<CreateNurseInput>({
    resolver: zodResolver(createNurseSchema),
    defaultValues: {
      name: nurse?.name || "",
      email: nurse?.email || "",
      nip: nurse?.nip || "",
      sip: nurse?.sip || "",
      certification: nurse?.certification || "",
      certificationExpiry: nurse?.certificationExpiry
        ? new Date(nurse.certificationExpiry).toISOString().split("T")[0]
        : "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createNurse,
    onSuccess: () => {
      toast.success("Perawat berhasil ditambahkan");
      onSuccess();
    },
    onError: () => {
      toast.error("Gagal menambahkan perawat");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateNurseInput>) =>
      updateNurse(nurse!.id, data),
    onSuccess: () => {
      toast.success("Perawat berhasil diperbarui");
      onSuccess();
    },
    onError: () => {
      toast.error("Gagal memperbarui perawat");
    },
  });

  const onSubmit = (data: CreateNurseInput) => {
    if (nurse) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Perawat</FormLabel>
              <FormControl>
                <Input placeholder="Ns. Jane Doe, S.Kep" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="perawat@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIP</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nomor Induk Pegawai"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SIP</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Surat Izin Praktik"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="certification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sertifikasi</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: Certified Dialysis Nurse"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="certificationExpiry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Masa Berlaku Sertifikasi</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : nurse ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
