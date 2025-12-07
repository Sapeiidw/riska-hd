"use client";

import { FormStatusSKKenaikanPangkat } from "@/components/form/status-sk-kenaikan-pangkat";
import { CrudPage, StatusSKKenaikanPangkat } from "../_lib";

const columns = [
  { key: "sudah_ttd_pertek", title: "Sudah TTD Pertek", type: "numeric" as const },
  { key: "belum_ttd_pertek", title: "Belum TTD Pertek", type: "numeric" as const },
];

const defaultData = {
  sudah_ttd_pertek: 0,
  belum_ttd_pertek: 0,
};

export default function Page() {
  return (
    <CrudPage<StatusSKKenaikanPangkat>
      title="Status SK Kenaikan Pangkat"
      description="Tambahkan data status SK kenaikan pangkat"
      apiEndpoint="status-sk-kenaikan-pangkat"
      queryKey="status-sk-kenaikan-pangkat"
      columns={columns}
      defaultData={defaultData}
      FormComponent={FormStatusSKKenaikanPangkat}
    />
  );
}
