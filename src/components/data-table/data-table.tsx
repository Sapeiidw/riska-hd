"use client";

import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
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
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Input } from "../ui/input";
import { DataTableViewOptions } from "./column-toggle";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  MoreHorizontal,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

function generatePaginationRange(
  currentPage: number,
  totalPages: number
): (number | "ellipsis")[] {
  const delta = 1;
  const range: (number | "ellipsis")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      range.push(i);
    }
    return range;
  }

  for (let i = 1; i <= Math.min(3, totalPages); i++) {
    range.push(i);
  }

  if (currentPage - delta > 4) {
    range.push("ellipsis");
  }

  const start = Math.max(4, currentPage - delta);
  const end = Math.min(totalPages - 3, currentPage + delta);

  for (let i = start; i <= end; i++) {
    if (!range.includes(i)) {
      range.push(i);
    }
  }

  if (currentPage + delta < totalPages - 3) {
    range.push("ellipsis");
  }

  for (let i = Math.max(totalPages - 2, 4); i <= totalPages; i++) {
    if (!range.includes(i)) {
      range.push(i);
    }
  }

  return range;
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

function ServerPagination({
  meta,
  onPageChange,
  onLimitChange,
}: {
  meta: { page?: number; limit?: number; total?: number; totalPages?: number };
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}) {
  const currentPage = meta.page || 1;
  const totalPages = meta.totalPages || 1;
  const limit = meta.limit || 10;
  const total = meta.total || 0;
  const paginationRange = generatePaginationRange(currentPage, totalPages);

  const startRow = total > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endRow = Math.min(currentPage * limit, total);

  const buttonClass =
    "inline-flex items-center justify-center size-8 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 shadow-sm";
  const activeButtonClass =
    "inline-flex items-center justify-center size-8 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 bg-sky-500 text-white border border-sky-500 shadow-sm";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 px-2">
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-500">
          Menampilkan{" "}
          <span className="font-semibold text-gray-700">{startRow}</span>
          {" - "}
          <span className="font-semibold text-gray-700">{endRow}</span>
          {" dari "}
          <span className="font-semibold text-gray-700">{total}</span>
          {" data"}
        </p>
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Tampilkan</span>
            <Select
              value={String(limit)}
              onValueChange={(value) => onLimitChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {/* First page << */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className={buttonClass}
          title="Halaman pertama"
        >
          <ChevronsLeft className="size-4" />
        </button>
        {/* Previous page < */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={buttonClass}
          title="Halaman sebelumnya"
        >
          <ChevronLeft className="size-4" />
        </button>

        {/* Page numbers - hidden on mobile */}
        <div className="hidden sm:flex items-center gap-1">
          {paginationRange.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="flex size-8 items-center justify-center text-gray-400"
              >
                <MoreHorizontal className="size-4" />
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={currentPage === page ? activeButtonClass : buttonClass}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Mobile page indicator */}
        <div className="flex sm:hidden items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl">
          <span className="text-sm font-bold text-sky-600">{currentPage}</span>
          <span className="text-sm text-gray-500">/</span>
          <span className="text-sm font-bold text-sky-600">{totalPages}</span>
        </div>

        {/* Next page > */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={buttonClass}
          title="Halaman selanjutnya"
        >
          <ChevronRight className="size-4" />
        </button>
        {/* Last page >> */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className={buttonClass}
          title="Halaman terakhir"
        >
          <ChevronsRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function ClientPagination<TData>({ table }: { table: ReturnType<typeof useReactTable<TData>> }) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const paginationRange = generatePaginationRange(currentPage, totalPages);

  const startRow = totalRows > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRow = Math.min(currentPage * pageSize, totalRows);

  const buttonClass =
    "inline-flex items-center justify-center size-8 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 bg-white hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 shadow-sm";
  const activeButtonClass =
    "inline-flex items-center justify-center size-8 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 bg-sky-500 text-white border border-sky-500 shadow-sm";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 px-2">
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-500">
          Menampilkan{" "}
          <span className="font-semibold text-gray-700">{startRow}</span>
          {" - "}
          <span className="font-semibold text-gray-700">{endRow}</span>
          {" dari "}
          <span className="font-semibold text-gray-700">{totalRows}</span>
          {" data"}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Tampilkan</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {/* First page << */}
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className={buttonClass}
          title="Halaman pertama"
        >
          <ChevronsLeft className="size-4" />
        </button>
        {/* Previous page < */}
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className={buttonClass}
          title="Halaman sebelumnya"
        >
          <ChevronLeft className="size-4" />
        </button>

        {/* Page numbers - hidden on mobile */}
        {totalPages > 0 && (
          <div className="hidden sm:flex items-center gap-1">
            {paginationRange.map((page, index) =>
              page === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex size-8 items-center justify-center text-gray-400"
                >
                  <MoreHorizontal className="size-4" />
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => table.setPageIndex(page - 1)}
                  className={currentPage === page ? activeButtonClass : buttonClass}
                >
                  {page}
                </button>
              )
            )}
          </div>
        )}

        {/* Mobile page indicator */}
        <div className="flex sm:hidden items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl">
          <span className="text-sm font-bold text-sky-600">{currentPage}</span>
          <span className="text-sm text-gray-500">/</span>
          <span className="text-sm font-bold text-sky-600">{totalPages || 1}</span>
        </div>

        {/* Next page > */}
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className={buttonClass}
          title="Halaman selanjutnya"
        >
          <ChevronRight className="size-4" />
        </button>
        {/* Last page >> */}
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          className={buttonClass}
          title="Halaman terakhir"
        >
          <ChevronsRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

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
  onLimitChange?: (limit: number) => void;
  onSearch?: (search: string) => void;
  searchValue?: string;
  showToolbar?: boolean;
  searchPlaceholder?: string;
  loading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  onPageChange,
  onLimitChange,
  onSearch,
  searchValue,
  showToolbar = true,
  searchPlaceholder = "Cari data...",
  loading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [localSearch, setLocalSearch] = useState<string>(searchValue ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync localSearch when searchValue prop changes externally
  useEffect(() => {
    if (searchValue !== undefined) {
      setLocalSearch(searchValue);
    }
  }, [searchValue]);

  const handleSearch = useCallback(
    (value: string) => {
      setLocalSearch(value);
      if (onSearch) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          onSearch(value);
        }, 400);
      }
    },
    [onSearch]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const rowNumberColumn: ColumnDef<TData, TValue> = useMemo(
    () => ({
      id: "_rowNumber",
      header: "No",
      cell: ({ row }) => {
        const offset = meta ? ((meta.page || 1) - 1) * (meta.limit || 10) : 0;
        return (
          <span className="text-sm text-muted-foreground font-medium">
            {offset + row.index + 1}
          </span>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 50,
    }),
    [meta]
  );

  const columnsWithRowNumber = useMemo(
    () => [rowNumberColumn, ...columns],
    [rowNumberColumn, columns]
  );

  const table = useReactTable({
    data,
    columns: columnsWithRowNumber,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: meta?.limit || 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {showToolbar && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
          <DataTableViewOptions table={table} />
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-gradient-to-r from-sky-50 to-cyan-50 hover:from-sky-50 hover:to-cyan-50 border-b border-gray-100"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="font-semibold text-gray-700"
                      >
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
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columnsWithRowNumber.length}
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
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
                    colSpan={columnsWithRowNumber.length}
                    className="h-24 text-center text-gray-400"
                  >
                    Tidak ada data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {meta && onPageChange ? (
        <ServerPagination
          meta={meta}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      ) : (
        <ClientPagination table={table} />
      )}
    </div>
  );
}
