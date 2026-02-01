"use client";

import { useQuery } from "@tanstack/react-query";
import { Shield, Check } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import api from "@/lib/api/axios";

import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-state";
import { ScrollArea } from "@/components/ui/scroll-area";

type Permission = {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
};

type RoleDetailData = {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
};

async function fetchRoleDetail(id: string) {
  const res = await api.get(`/api/settings/roles/${id}`);
  return res.data;
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

interface RoleDetailProps {
  roleId: string;
}

export function RoleDetail({ roleId }: RoleDetailProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["role", roleId],
    queryFn: () => fetchRoleDetail(roleId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Gagal memuat detail role
      </div>
    );
  }

  const role: RoleDetailData = data.data;

  // Group permissions by resource
  const groupedPermissions = role.permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-sky-100">
          <Shield className="h-6 w-6 text-sky-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{role.displayName}</h3>
          <Badge variant="outline" className="mt-1">
            {role.name}
          </Badge>
          {role.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {role.description}
            </p>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Dibuat:</span>
          <span className="ml-2">
            {format(new Date(role.createdAt), "dd MMM yyyy HH:mm", {
              locale: localeId,
            })}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Diperbarui:</span>
          <span className="ml-2">
            {format(new Date(role.updatedAt), "dd MMM yyyy HH:mm", {
              locale: localeId,
            })}
          </span>
        </div>
      </div>

      {/* Permissions */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          Permissions
          <Badge variant="secondary">{role.permissions.length}</Badge>
        </h4>
        <ScrollArea className="h-64 rounded-md border p-4">
          {Object.keys(groupedPermissions).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Tidak ada permission yang ditetapkan
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(
                ([resource, permissions]) => (
                  <div key={resource}>
                    <h5 className="text-sm font-medium mb-2">
                      {resourceLabels[resource] || resource}
                    </h5>
                    <div className="flex flex-wrap gap-2 ml-2">
                      {permissions.map((permission) => (
                        <Badge
                          key={permission.id}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" />
                          {actionLabels[permission.action] || permission.action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
