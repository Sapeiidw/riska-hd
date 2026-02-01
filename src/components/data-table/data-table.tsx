"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Input } from "../ui/input";
import { DataTableViewOptions } from "./column-toggle";
import { DataTablePagination } from "./pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  onPageChange?: (page: number) => void;
  showSearch?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  onPageChange,
  showSearch = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<unknown | string>("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),

    getPaginationRowModel: getPaginationRowModel(),

    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "auto",
    onGlobalFilterChange: setGlobalFilter,

    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,

    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="flex items-center gap-2">
          <Input
            value={(globalFilter ?? "") as string}
            onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            placeholder="Search..."
            className="max-w-sm"
          />
          <DataTableViewOptions table={table} />
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gradient-to-r from-sky-50 to-cyan-50 hover:from-sky-50 hover:to-cyan-50 border-b border-gray-100">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold text-gray-700">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-sky-50/50 transition-colors border-b border-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-gray-600">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-400"
                >
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {meta && onPageChange ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 px-2">
          <p className="text-sm text-gray-500">
            Menampilkan{" "}
            <span className="font-semibold text-gray-700">
              {((meta.page || 1) - 1) * (meta.limit || 10) + 1}
            </span>
            {" - "}
            <span className="font-semibold text-gray-700">
              {Math.min((meta.page || 1) * (meta.limit || 10), meta.total || 0)}
            </span>
            {" dari "}
            <span className="font-semibold text-gray-700">{meta.total || 0}</span>
            {" data"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange((meta.page || 1) - 1)}
              disabled={(meta.page || 1) <= 1}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 h-9 px-4 shadow-sm"
            >
              Sebelumnya
            </button>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl">
              <span className="text-sm text-gray-500">Halaman</span>
              <span className="text-sm font-bold text-sky-600">{meta.page || 1}</span>
              <span className="text-sm text-gray-500">dari</span>
              <span className="text-sm font-bold text-sky-600">{meta.totalPages || 1}</span>
            </div>
            <button
              onClick={() => onPageChange((meta.page || 1) + 1)}
              disabled={(meta.page || 1) >= (meta.totalPages || 1)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 h-9 px-4 shadow-sm"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      ) : (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}
