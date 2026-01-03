"use client";

import { FormStatusDokumenWajib } from "@/components/form/status-dokumen-wajib";
import { CrudPage, StatusDokumenWajib, useOpdBySlug } from "@/lib/opd";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

const columns = [
  { key: "berhasil", title: "Berhasil" },
  { key: "tidak_berhasil", title: "Tidak Berhasil" },
];

const defaultData = {
  berhasil: 0,
  tidak_berhasil: 0,
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
    <CrudPage<StatusDokumenWajib>
      opdId={opd.id}
      title="Status Dokumen Wajib"
      description="Tambahkan data status dokumen wajib"
      apiEndpoint="status-dokumen-wajib"
      queryKey="status-dokumen-wajib"
      columns={columns}
      defaultData={defaultData}
      FormComponent={FormStatusDokumenWajib}
    />
  );
}
