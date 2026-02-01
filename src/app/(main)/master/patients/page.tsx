"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Users, UserCheck, UserX, Activity } from "lucide-react";
import Link from "next/link";

import { MasterPageLayout, TableSkeleton } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { columns } from "./columns";

async function fetchPatients(page: number, search: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "10",
    ...(search && { search }),
  });
  const res = await fetch(`/api/master/patients?${params}`);
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
}

type Patient = {
  id: string;
  isActive: boolean;
};

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["patients", page, search],
    queryFn: () => fetchPatients(page, search),
  });

  const stats = data?.meta ? [
    {
      label: "Total Pasien",
      value: data.meta.total || 0,
      icon: Users,
      color: "default" as const,
    },
    {
      label: "Pasien Aktif",
      value: data.data?.filter((p: Patient) => p.isActive).length || 0,
      icon: UserCheck,
      color: "success" as const,
    },
    {
      label: "Pasien Nonaktif",
      value: data.data?.filter((p: Patient) => !p.isActive).length || 0,
      icon: UserX,
      color: "danger" as const,
    },
    {
      label: "HD Hari Ini",
      value: 0,
      icon: Activity,
      color: "warning" as const,
    },
  ] : undefined;

  return (
    <MasterPageLayout
      title="Daftar Pasien"
      description="Kelola data pasien hemodialisa"
      icon={Users}
      stats={stats}
      searchPlaceholder="Cari nama, RM, atau NIK..."
      searchValue={search}
      onSearchChange={(value) => {
        setSearch(value);
        setPage(1);
      }}
      addButtonLabel="Tambah Pasien"
      onAddClick={() => window.location.href = "/master/patients/new"}
    >
      {isLoading ? (
        <TableSkeleton rows={5} columns={7} />
      ) : error ? (
        <EmptyState
          title="Gagal memuat data"
          description="Terjadi kesalahan saat memuat data pasien"
        />
      ) : data?.data?.length === 0 ? (
        <EmptyState
          title="Belum ada pasien"
          description="Mulai dengan menambahkan pasien baru"
        >
          <Link href="/master/patients/new">
            <Button>Tambah Pasien</Button>
          </Link>
        </EmptyState>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          meta={data?.meta}
          onPageChange={setPage}
        />
      )}
    </MasterPageLayout>
  );
}
