"use client";

import { FormStatusKenaikanPangkat } from "@/components/form/status-kenaikan-pangkat";
import { CrudPage, StatusKenaikanPangkat } from "@/lib/opd";

const OPD_ID = 14;

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
  return (
    <CrudPage<StatusKenaikanPangkat>
      opdId={OPD_ID}
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
