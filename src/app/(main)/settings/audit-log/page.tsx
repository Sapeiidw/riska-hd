"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  Search,
  ScrollText,
  Eye,
  Filter,
  Calendar,
  User,
  Monitor,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import api from "@/lib/api/axios";

import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/data-table/data-table";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type AuditLog = {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

const actionLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  create: { label: "Create", variant: "default" },
  read: { label: "Read", variant: "secondary" },
  update: { label: "Update", variant: "outline" },
  delete: { label: "Delete", variant: "destructive" },
  login: { label: "Login", variant: "default" },
  logout: { label: "Logout", variant: "secondary" },
};

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
  user: "User",
  role: "Role",
  session: "Session",
};

async function fetchAuditLogs(
  page: number,
  search: string,
  action: string,
  resource: string
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "20",
    ...(search && { search }),
    ...(action && { action }),
    ...(resource && { resource }),
  });
  const res = await api.get(`/api/settings/audit-log?${params}`);
  return res.data;
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["audit-logs", page, search, action, resource],
    queryFn: () => fetchAuditLogs(page, search, action, resource),
    placeholderData: keepPreviousData,
  });

  const columns: ColumnDef<AuditLog>[] = useMemo(() => [
    {
      accessorKey: "createdAt",
      header: "Waktu",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return (
          <span className="text-sm">
            {format(new Date(date), "dd MMM yyyy HH:mm:ss", { locale: localeId })}
          </span>
        );
      },
    },
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-sky-100 flex items-center justify-center">
            <User className="size-4 text-sky-600" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {row.original.userName || "System"}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.userEmail || "-"}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Aksi",
      cell: ({ row }) => {
        const action = row.getValue("action") as string;
        const actionInfo = actionLabels[action] || {
          label: action,
          variant: "outline" as const,
        };
        return <Badge variant={actionInfo.variant}>{actionInfo.label}</Badge>;
      },
    },
    {
      accessorKey: "resource",
      header: "Resource",
      cell: ({ row }) => {
        const resource = row.getValue("resource") as string;
        return (
          <Badge variant="outline">
            {resourceLabels[resource] || resource}
          </Badge>
        );
      },
    },
    {
      accessorKey: "resourceId",
      header: "ID",
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {(row.getValue("resourceId") as string)?.slice(0, 8) || "-"}
        </span>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => (
        <span className="text-xs font-mono">
          {row.getValue("ipAddress") || "-"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedLog(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ], []);

  return (
    <div className="col-span-12 space-y-6">
      <PageHeader
        title="Audit Log"
        description="Pantau semua aktivitas pengguna di sistem"
      />

      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={action}
          onValueChange={(value) => {
            setAction(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Semua Aksi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Aksi</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={resource}
          onValueChange={(value) => {
            setResource(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Semua Resource" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Resource</SelectItem>
            {Object.entries(resourceLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(action || resource) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAction("");
              setResource("");
              setPage(1);
            }}
          >
            Reset Filter
          </Button>
        )}
      </div>

      {isLoading && !data ? (
        <LoadingState message="Memuat audit log..." />
      ) : error && !data ? (
        <EmptyState
          title="Gagal memuat data"
          description="Terjadi kesalahan saat memuat audit log"
        />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          meta={data?.meta}
          onPageChange={setPage}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchValue={search}
          searchPlaceholder="Cari..."
          loading={isFetching}
        />
      )}

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Audit Log</DialogTitle>
          </DialogHeader>
          {selectedLog && <AuditLogDetail log={selectedLog} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AuditLogDetail({ log }: { log: AuditLog }) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Waktu</p>
          <p className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(log.createdAt), "dd MMMM yyyy HH:mm:ss", {
              locale: localeId,
            })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">User</p>
          <p className="font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            {log.userName || "System"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Aksi</p>
          <Badge
            variant={
              actionLabels[log.action]?.variant || ("outline" as const)
            }
          >
            {actionLabels[log.action]?.label || log.action}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Resource</p>
          <Badge variant="outline">
            {resourceLabels[log.resource] || log.resource}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Resource ID</p>
          <p className="font-mono text-sm">{log.resourceId || "-"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">IP Address</p>
          <p className="font-mono text-sm">{log.ipAddress || "-"}</p>
        </div>
      </div>

      {/* User Agent */}
      {log.userAgent && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            User Agent
          </p>
          <p className="text-xs font-mono bg-muted p-2 rounded">
            {log.userAgent}
          </p>
        </div>
      )}

      {/* Old Values */}
      {log.oldValues && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Nilai Lama</p>
          <ScrollArea className="h-32 rounded-md border">
            <pre className="text-xs p-3 font-mono">
              {JSON.stringify(JSON.parse(log.oldValues), null, 2)}
            </pre>
          </ScrollArea>
        </div>
      )}

      {/* New Values */}
      {log.newValues && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Nilai Baru</p>
          <ScrollArea className="h-32 rounded-md border">
            <pre className="text-xs p-3 font-mono">
              {JSON.stringify(JSON.parse(log.newValues), null, 2)}
            </pre>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
