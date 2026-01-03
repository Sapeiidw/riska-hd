"use client";

import { FormStatusSKKenaikanPangkat } from "@/components/form/status-sk-kenaikan-pangkat";
import { CrudPage, StatusSKKenaikanPangkat, useOpdBySlug } from "@/lib/opd";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

const columns = [
  { key: "sudah_ttd_pertek", title: "Sudah TTD" },
  { key: "belum_ttd_pertek", title: "Belum TTD" },
];

const defaultData = {
  sudah_ttd_pertek: 0,
  belum_ttd_pertek: 0,
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
    <CrudPage<StatusSKKenaikanPangkat>
      opdId={opd.id}
      title="Status SK Kenaikan Pangkat"
      description="Tambahkan data status sk kenaikan pangkat"
      apiEndpoint="status-sk-kenaikan-pangkat"
      queryKey="status-sk-kenaikan-pangkat"
      columns={columns}
      defaultData={defaultData}
      FormComponent={FormStatusSKKenaikanPangkat}
    />
  );
}
