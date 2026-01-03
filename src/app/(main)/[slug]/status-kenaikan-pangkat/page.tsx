"use client";

import { FormStatusKenaikanPangkat } from "@/components/form/status-kenaikan-pangkat";
import { CrudPage, StatusKenaikanPangkat, useOpdBySlug } from "@/lib/opd";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

const columns = [
  { key: "input_berkas", title: "Input Berkas" },
  { key: "berkas_disimpan", title: "Berkas Disimpan" },
  { key: "bts", title: "BTS" },
  { key: "sudah_ttd_pertek", title: "Sudah TTD" },
  { key: "tms", title: "TMS" },
];

const defaultData = {
  input_berkas: 0,
  berkas_disimpan: 0,
  bts: 0,
  sudah_ttd_pertek: 0,
  tms: 0,
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
    <CrudPage<StatusKenaikanPangkat>
      opdId={opd.id}
      title="Status Kenaikan Pangkat"
      description="Tambahkan data status kenaikan pangkat"
      apiEndpoint="status-kenaikan-pangkat"
      queryKey="status-kenaikan-pangkat"
      columns={columns}
      defaultData={defaultData}
      FormComponent={FormStatusKenaikanPangkat}
    />
  );
}
