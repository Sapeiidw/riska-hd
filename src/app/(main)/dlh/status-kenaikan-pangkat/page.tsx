"use client";

import { FormStatusKenaikanPangkat } from "@/components/form/status-kenaikan-pangkat";
import { CrudPage, StatusKenaikanPangkat } from "../_lib";

const columns = [
  { key: "input_berkas", title: "Input Berkas", type: "numeric" as const },
  { key: "berkas_disimpan", title: "Berkas Disimpan", type: "numeric" as const },
  { key: "bts", title: "BTS", type: "numeric" as const },
  { key: "sudah_ttd_pertek", title: "Sudah TTD Pertek", type: "numeric" as const },
  { key: "tms", title: "TMS", type: "numeric" as const },
];

const defaultData = {
  input_berkas: 0,
  berkas_disimpan: 0,
  bts: 0,
  sudah_ttd_pertek: 0,
  tms: 0,
};

export default function Page() {
  return (
    <CrudPage<StatusKenaikanPangkat>
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
