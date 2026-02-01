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
import { Textarea } from "@/components/ui/textarea";
import { createRoomSchema, CreateRoomInput } from "@/lib/validations/facility";

interface RoomFormProps {
  room?: {
    id: string;
    name: string;
    code: string;
    floor: string | null;
    capacity: number;
    description: string | null;
  } | null;
  onSuccess: () => void;
}

async function createRoom(data: CreateRoomInput) {
  const res = await fetch("/api/master/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create room");
  return res.json();
}

async function updateRoom(id: string, data: Partial<CreateRoomInput>) {
  const res = await fetch(`/api/master/rooms/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update room");
  return res.json();
}

export function RoomForm({ room, onSuccess }: RoomFormProps) {
  const form = useForm<CreateRoomInput>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: room?.name || "",
      code: room?.code || "",
      floor: room?.floor || "",
      capacity: room?.capacity || 1,
      description: room?.description || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      toast.success("Ruangan berhasil ditambahkan");
      onSuccess();
    },
    onError: () => {
      toast.error("Gagal menambahkan ruangan");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateRoomInput>) =>
      updateRoom(room!.id, data),
    onSuccess: () => {
      toast.success("Ruangan berhasil diperbarui");
      onSuccess();
    },
    onError: () => {
      toast.error("Gagal memperbarui ruangan");
    },
  });

  const onSubmit = (data: CreateRoomInput) => {
    if (room) {
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
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Ruangan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: HD-01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Ruangan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Ruang HD Lantai 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lantai</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: 1"
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
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kapasitas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deskripsi ruangan (opsional)"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : room ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
