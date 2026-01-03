"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { FormOpd } from "@/components/form/opd";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OpdConfig, useDeleteOpd, useOpdList } from "@/lib/opd";
import { useAuth } from "@clerk/nextjs";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export default function AdminOpdPage() {
  const { sessionClaims } = useAuth();
  const isAdmin = sessionClaims?.role === "admin";

  const [isOpenForm, setIsOpenForm] = useState(false);
  const [currentData, setCurrentData] = useState<OpdConfig | null>(null);

  const { data: opdList, isLoading } = useOpdList();
  const deleteMutation = useDeleteOpd();

  const handleEdit = useCallback((data: OpdConfig) => {
    setCurrentData(data);
    setIsOpenForm(true);
  }, []);

  const handleDelete = useCallback(
    (data: OpdConfig) => {
      if (confirm(`Hapus OPD "${data.nama}"?`)) {
        deleteMutation.mutate(data.id, {
          onSuccess: () => toast.success("OPD berhasil dihapus"),
          onError: () => toast.error("Gagal menghapus OPD"),
        });
      }
    },
    [deleteMutation]
  );

  const handleSuccess = useCallback(() => {
    setIsOpenForm(false);
    setCurrentData(null);
  }, []);

  const handleOpenNew = useCallback(() => {
    setCurrentData(null);
    setIsOpenForm(true);
  }, []);

  const columns = useMemo(
    (): ColumnDef<OpdConfig>[] => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
      },
      {
        accessorKey: "nama",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nama OPD" />
        ),
      },
      {
        accessorKey: "singkatan",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Singkatan" />
        ),
      },
      {
        accessorKey: "slug",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Slug" />
        ),
        cell: ({ row }) => (
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            /{row.getValue("slug")}
          </code>
        ),
      },
      {
        accessorKey: "parent_id",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Parent" />
        ),
        cell: ({ row }) => {
          const parentId = row.original.parent_id;
          if (!parentId) return <span className="text-gray-400">-</span>;
          const parent = opdList?.find((o) => o.id === parentId);
          return parent ? (
            <span className="text-purple-600">{parent.singkatan}</span>
          ) : (
            <span className="text-gray-400">-</span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(row.original.slug)}
              >
                Copy Slug
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleEdit(row.original)}
                disabled={!isAdmin}
              >
                Edit OPD
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(row.original)}
                disabled={!isAdmin}
                className="text-red-600"
              >
                Hapus OPD
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleEdit, handleDelete, isAdmin, opdList]
  );

  if (isLoading) {
    return (
      <div className="col-span-full flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold col-span-full">Kelola OPD</h1>

      <Dialog open={isOpenForm} onOpenChange={setIsOpenForm}>
        <DialogTrigger asChild>
          <Button onClick={handleOpenNew} disabled={!isAdmin}>
            Tambah OPD
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentData ? "Edit OPD" : "Tambah OPD Baru"}
            </DialogTitle>
            <DialogDescription>
              {currentData
                ? "Ubah data OPD yang sudah ada"
                : "Tambahkan OPD baru ke sistem"}
            </DialogDescription>
            <FormOpd initialData={currentData} onSuccess={handleSuccess} />
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="col-span-full">
        {opdList && <DataTable columns={columns} data={opdList} />}
      </div>
    </>
  );
}
