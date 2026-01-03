"use client";

import { FormStatusPegawai } from "@/components/form/status-pegawai";
import { CrudPage, StatusPegawai, useOpdBySlug } from "@/lib/opd";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

const columns = [
  { key: "nama", title: "Nama", type: "text" as const },
  { key: "nip", title: "NIP", type: "text" as const },
  { key: "golongan", title: "Golongan", type: "text" as const },
  { key: "status", title: "Status", type: "text" as const },
  { key: "keterangan", title: "Keterangan", type: "text" as const },
];

const defaultData = {
  nama: "",
  nip: "",
  golongan: "",
  status: "",
  keterangan: "",
};

export default function Page() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: opd, isLoading, notFound: opdNotFound } = useOpdBySlug(slug);

  if (isLoading) {
    return (
      <div className="col-span-12 flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (opdNotFound || !opd) {
    notFound();
  }

  return (
    <CrudPage<StatusPegawai>
      opdId={opd.id}
      title="Status Pegawai"
      description="Tambahkan data status pegawai"
      apiEndpoint="status-pegawai"
      queryKey="status-pegawai"
      columns={columns}
      defaultData={defaultData}
      FormComponent={FormStatusPegawai}
    />
  );
}
