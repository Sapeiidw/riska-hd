"use client";

import { FormStatusSKKenaikanPangkat } from "@/components/form/status-sk-kenaikan-pangkat";
import { CrudPage, StatusSKKenaikanPangkat } from "@/lib/opd";

const OPD_ID = 8;

const columns = [
  { key: "sudah_ttd_pertek", title: "Sudah TTD" },
  { key: "belum_ttd_pertek", title: "Belum TTD" },
];

const defaultData = {
  sudah_ttd_pertek: 0,
  belum_ttd_pertek: 0,
};

export default function Page() {
  return (
    <CrudPage<StatusSKKenaikanPangkat>
      opdId={OPD_ID}
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
