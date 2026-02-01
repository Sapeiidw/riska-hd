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
import { createDoctorSchema, CreateDoctorInput } from "@/lib/validations/staff";

interface DoctorFormProps {
  doctor?: {
    id: string;
    name: string;
    email: string;
    nip: string | null;
    sip: string | null;
    specialization: string | null;
    licenseExpiry: string | null;
  } | null;
  onSuccess: () => void;
}

async function createDoctor(data: CreateDoctorInput) {
  const res = await api.post("/api/master/doctors", data);
  return res.data;
}

async function updateDoctor(id: string, data: Partial<CreateDoctorInput>) {
  const res = await api.put(`/api/master/doctors/${id}`, data);
  return res.data;
}

export function DoctorForm({ doctor, onSuccess }: DoctorFormProps) {
  const form = useForm<CreateDoctorInput>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: {
      name: doctor?.name || "",
      email: doctor?.email || "",
      nip: doctor?.nip || "",
      sip: doctor?.sip || "",
      specialization: doctor?.specialization || "",
      licenseExpiry: doctor?.licenseExpiry
        ? new Date(doctor.licenseExpiry).toISOString().split("T")[0]
        : "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      toast.success("Dokter berhasil ditambahkan");
      onSuccess();
    },
    onError: () => {
      toast.error("Gagal menambahkan dokter");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateDoctorInput>) =>
      updateDoctor(doctor!.id, data),
    onSuccess: () => {
      toast.success("Dokter berhasil diperbarui");
      onSuccess();
    },
    onError: () => {
      toast.error("Gagal memperbarui dokter");
    },
  });

  const onSubmit = (data: CreateDoctorInput) => {
    if (doctor) {
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
              <FormLabel>Nama Dokter</FormLabel>
              <FormControl>
                <Input placeholder="dr. John Doe, Sp.PD-KGH" {...field} />
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
                  placeholder="dokter@example.com"
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
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spesialisasi</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: Spesialis Penyakit Dalam"
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
          name="licenseExpiry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Masa Berlaku SIP</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : doctor ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
