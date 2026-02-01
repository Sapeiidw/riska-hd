"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4 bg-gray-100",
            i === 0 ? "w-32" : i === columns - 1 ? "w-16" : "w-24"
          )}
        />
      ))}
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({
  rows = 5,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-sky-50 to-cyan-50 border-b border-gray-100">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                "h-4 bg-sky-100",
                i === 0 ? "w-24" : i === columns - 1 ? "w-12" : "w-20"
              )}
            />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} columns={columns} />
        ))}
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 px-2">
        <Skeleton className="h-4 w-48 bg-gray-100" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl bg-gray-100" />
          <Skeleton className="h-9 w-36 rounded-xl bg-gradient-to-r from-sky-50 to-cyan-50" />
          <Skeleton className="h-9 w-24 rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-4 w-20 bg-gray-100" />
        <Skeleton className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-100 to-cyan-100" />
      </div>
      <Skeleton className="h-8 w-16 bg-gray-100" />
      <Skeleton className="h-3 w-24 mt-2 bg-gray-100" />
    </div>
  );
}

// Master Page Skeleton (complete page loading)
export function MasterPageSkeleton({
  showStats = true,
  statsCount = 4,
  tableRows = 5,
  tableColumns = 5,
}: {
  showStats?: boolean;
  statsCount?: number;
  tableRows?: number;
  tableColumns?: number;
}) {
  return (
    <div className="col-span-12 space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>

        {showStats && (
          <CardContent className="border-b pb-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: statsCount }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          </CardContent>
        )}

        <CardContent className={showStats ? "pt-4" : "pt-0"}>
          {/* Search */}
          <div className="mb-4">
            <Skeleton className="h-9 w-full max-w-sm" />
          </div>
          {/* Table */}
          <TableSkeleton rows={tableRows} columns={tableColumns} />
        </CardContent>
      </Card>
    </div>
  );
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Card Skeleton
export function CardSkeleton({
  className,
  hasHeader = true,
  contentLines = 3,
}: {
  className?: string;
  hasHeader?: boolean;
  contentLines?: number;
}) {
  return (
    <Card className={className}>
      {hasHeader && (
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-3 w-48" />
        </CardHeader>
      )}
      <CardContent className={!hasHeader ? "pt-6" : ""}>
        <div className="space-y-3">
          {Array.from({ length: contentLines }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn("h-4", i === contentLines - 1 ? "w-3/4" : "w-full")}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Form Skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// Profile/User Card Skeleton
export function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
}
