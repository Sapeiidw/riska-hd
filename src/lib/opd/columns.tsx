"use client";

import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { BaseEntity, StatusPegawaiRow } from "./types";

export const tahunColumn = <T extends BaseEntity>(): ColumnDef<T> => ({
  accessorKey: "tahun",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Tahun" />
  ),
  cell: ({ row }) => new Date(row.getValue("periode")).getFullYear(),
});

export const periodeColumn = <T extends BaseEntity>(): ColumnDef<T> => ({
  accessorKey: "periode",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Bulan" />
  ),
  cell: ({ row }) =>
    new Date(row.getValue("periode")).toLocaleDateString("id-ID", {
      month: "long",
    }),
});

export const namaOpdColumn = <T extends BaseEntity>(): ColumnDef<T> => ({
  accessorKey: "nama_opd",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Nama OPD" />
  ),
});

export const createActionsColumn = <T extends BaseEntity>(
  onEdit: (data: T) => void,
  onDelete: (data: T) => void,
  isAdmin: boolean
): ColumnDef<T> => ({
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
          onClick={() => navigator.clipboard.writeText(row.id)}
        >
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(row.original)} disabled={!isAdmin}>
          Edit Data
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(row.original)} disabled={!isAdmin}>
          Hapus Data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
});

export const createNumericColumn = <T extends BaseEntity>(
  accessorKey: string,
  title: string
): ColumnDef<T> => ({
  accessorKey,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title={title} />
  ),
});

export const createTextColumn = <T extends BaseEntity>(
  accessorKey: string,
  title: string
): ColumnDef<T> => ({
  accessorKey,
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title={title} />
  ),
});

export const baseColumns = <T extends BaseEntity>(): ColumnDef<T>[] => [
  tahunColumn<T>(),
  periodeColumn<T>(),
  namaOpdColumn<T>(),
];

// Status Pegawai columns for dashboard table
export const statusPegawaiColumns: ColumnDef<StatusPegawaiRow>[] = [
  {
    accessorKey: "tahun",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tahun" />
    ),
    cell: ({ row }) => new Date(row.getValue("periode")).getFullYear(),
  },
  {
    accessorKey: "periode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bulan" />
    ),
    cell: ({ row }) =>
      new Date(row.getValue("periode")).toLocaleDateString("id-ID", {
        month: "long",
      }),
  },
  {
    accessorKey: "nama_opd",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama OPD" />
    ),
  },
  {
    accessorKey: "nama",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama" />
    ),
  },
  {
    accessorKey: "nip",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NIP" />
    ),
  },
  {
    accessorKey: "golongan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Golongan" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  },
  {
    accessorKey: "keterangan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Keterangan" />
    ),
  },
];
