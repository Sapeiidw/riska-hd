"use client";

import { FormKenaikanPangkat } from "@/components/form/kenaikan-pangkat";
import { CrudPage, KenaikanPangkat, useOpdBySlug } from "@/lib/opd";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

const columns = [{ key: "value", title: "Jumlah" }];

const defaultData = {
  value: 0,
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
    <CrudPage<KenaikanPangkat>
      opdId={opd.id}
      title="Kenaikan Pangkat"
      description="Tambahkan data kenaikan pangkat"
      apiEndpoint="kenaikan-pangkat"
      queryKey="kenaikan-pangkat"
      columns={columns}
      defaultData={defaultData}
      FormComponent={FormKenaikanPangkat}
    />
  );
}
