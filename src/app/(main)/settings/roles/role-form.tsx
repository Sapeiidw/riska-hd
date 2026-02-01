"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/shared/loading-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const roleFormSchema = z.object({
  name: z.string().min(1, "Nama role wajib diisi"),
  displayName: z.string().min(1, "Display name wajib diisi"),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  role?: {
    id: string;
    name: string;
    displayName: string;
    description: string | null;
  } | null;
  onSuccess: () => void;
}

type Permission = {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
};

async function fetchPermissions() {
  const res = await fetch("/api/settings/permissions");
  if (!res.ok) throw new Error("Failed to fetch permissions");
  return res.json();
}

async function fetchRoleDetail(id: string) {
  const res = await fetch(`/api/settings/roles/${id}`);
  if (!res.ok) throw new Error("Failed to fetch role");
  return res.json();
}

async function createRole(data: RoleFormValues) {
  const res = await fetch("/api/settings/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create role");
  return res.json();
}

async function updateRole(id: string, data: Partial<RoleFormValues>) {
  const res = await fetch(`/api/settings/roles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update role");
  return res.json();
}

const resourceLabels: Record<string, string> = {
  patient: "Pasien",
  doctor: "Dokter",
  nurse: "Perawat",
  room: "Ruangan",
  hd_machine: "Mesin HD",
  shift: "Shift",
  diagnosis: "Diagnosa",
  medication: "Obat",
  hd_protocol: "Protokol HD",
  complication: "Komplikasi",
  user: "User",
  role: "Role",
  audit_log: "Audit Log",
};

const actionLabels: Record<string, string> = {
  create: "Tambah",
  read: "Lihat",
  update: "Edit",
  delete: "Hapus",
  manage: "Kelola",
};

export function RoleForm({ role, onSuccess }: RoleFormProps) {
  const { data: permissionsData, isLoading: loadingPermissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
  });

  const { data: roleDetail, isLoading: loadingRole } = useQuery({
    queryKey: ["role", role?.id],
    queryFn: () => fetchRoleDetail(role!.id),
    enabled: !!role?.id,
  });

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name || "",
      displayName: role?.displayName || "",
      description: role?.description || "",
      permissions: [],
    },
  });

  // Update form when role detail is loaded
  if (roleDetail?.data && form.getValues("permissions").length === 0 && roleDetail.data.permissions?.length > 0) {
    form.setValue(
      "permissions",
      roleDetail.data.permissions.map((p: Permission) => p.name)
    );
  }

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success("Role berhasil ditambahkan");
      onSuccess();
    },
    onError: () => {
      toast.error("Gagal menambahkan role");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<RoleFormValues>) => updateRole(role!.id, data),
    onSuccess: () => {
      toast.success("Role berhasil diperbarui");
      onSuccess();
    },
    onError: () => {
      toast.error("Gagal memperbarui role");
    },
  });

  const onSubmit = (data: RoleFormValues) => {
    if (role) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (loadingPermissions || (role && loadingRole)) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const groupedPermissions = permissionsData?.data?.grouped || {};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Role</FormLabel>
                <FormControl>
                  <Input placeholder="admin" {...field} />
                </FormControl>
                <FormDescription>Kode unik untuk role ini</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Tampilan</FormLabel>
                <FormControl>
                  <Input placeholder="Administrator" {...field} />
                </FormControl>
                <FormDescription>Nama yang ditampilkan di UI</FormDescription>
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
                  placeholder="Deskripsi singkat tentang role ini..."
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
          name="permissions"
          render={() => (
            <FormItem>
              <FormLabel>Permissions</FormLabel>
              <FormDescription>
                Pilih permissions yang dimiliki role ini
              </FormDescription>
              <ScrollArea className="h-64 rounded-md border p-4">
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(
                    ([resource, permissions]) => (
                      <div key={resource}>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Badge variant="outline">
                            {resourceLabels[resource] || resource}
                          </Badge>
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 ml-2">
                          {(permissions as Permission[]).map((permission) => (
                            <FormField
                              key={permission.id}
                              control={form.control}
                              name="permissions"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(
                                        permission.name
                                      )}
                                      onCheckedChange={(checked) => {
                                        const value = field.value || [];
                                        if (checked) {
                                          field.onChange([
                                            ...value,
                                            permission.name,
                                          ]);
                                        } else {
                                          field.onChange(
                                            value.filter(
                                              (v) => v !== permission.name
                                            )
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {actionLabels[permission.action] ||
                                      permission.action}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : role ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
