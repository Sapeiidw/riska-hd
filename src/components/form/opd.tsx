"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OpdConfig, useOpdList } from "@/lib/opd";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z4 from "zod/v4";

export const formSchema = z4.object({
  id: z4.number().nullish(),
  nama: z4.string().min(1, "Nama tidak boleh kosong"),
  singkatan: z4.string().min(1, "Singkatan tidak boleh kosong"),
  slug: z4
    .string()
    .min(1, "Slug tidak boleh kosong")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  parent_id: z4.number().nullish(),
});

type FormData = z4.infer<typeof formSchema>;

interface FormOpdProps {
  initialData?: OpdConfig | null;
  onSuccess?: () => void;
}

export function FormOpd({ initialData, onSuccess }: FormOpdProps) {
  const queryClient = useQueryClient();
  const { data: opdList } = useOpdList();

  // Filter out the current OPD and its children to prevent circular references
  const availableParents = opdList?.filter(
    (opd) => opd.id !== initialData?.id && opd.parent_id !== initialData?.id
  );

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const method = data.id ? "PUT" : "POST";
      const url = data.id ? `/api/opd/${data.id}` : "/api/opd";

      const response = await fetch(url, {
        method,
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success(initialData?.id ? "Update berhasil!" : "OPD berhasil dibuat!");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["opd-list"] });
      onSuccess?.();
    },
    onError: () => {
      toast.error("Gagal menyimpan data. Silakan coba lagi.");
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      nama: "",
      singkatan: "",
      slug: "",
      parent_id: null,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  // Auto-generate slug from singkatan
  const singkatan = form.watch("singkatan");
  useEffect(() => {
    if (!initialData?.id && singkatan) {
      const slug = singkatan
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      form.setValue("slug", slug);
    }
  }, [singkatan, initialData?.id, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 mx-auto w-full grid grid-cols-12 gap-x-4"
      >
        {initialData?.id && <input type="hidden" {...form.register("id")} />}

        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Nama OPD</FormLabel>
              <FormControl>
                <Input placeholder="Dinas Kesehatan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="singkatan"
          render={({ field }) => (
            <FormItem className="col-span-6">
              <FormLabel>Singkatan</FormLabel>
              <FormControl>
                <Input placeholder="DINKES" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem className="col-span-6">
              <FormLabel>Slug (URL)</FormLabel>
              <FormControl>
                <Input placeholder="dinkes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parent_id"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Parent OPD (Opsional)</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === "none" ? null : parseInt(value))
                }
                value={field.value?.toString() ?? "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih parent OPD (opsional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Tidak ada (OPD Induk)</SelectItem>
                  {availableParents?.map((opd) => (
                    <SelectItem key={opd.id} value={opd.id.toString()}>
                      {opd.nama} ({opd.singkatan})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className="col-span-6"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? initialData?.id
              ? "Menyimpan..."
              : "Membuat..."
            : "Simpan"}
        </Button>
        <Button
          className="col-span-6"
          type="reset"
          onClick={() => form.reset()}
          variant="destructive"
        >
          Reset
        </Button>
      </form>
    </Form>
  );
}
