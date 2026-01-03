"use client";

import { FormStatusDokumenWajib } from "@/components/form/status-dokumen-wajib";
import { CrudPage, StatusDokumenWajib } from "@/lib/opd";

const OPD_ID = 15;

const columns = [
  { key: "berhasil", title: "Berhasil" },
  { key: "tidak_berhasil", title: "Tidak Berhasil" },
];

const defaultData = {
  berhasil: 0,
  tidak_berhasil: 0,
};

export default function Page() {
  return (
    <CrudPage<StatusDokumenWajib>
      opdId={OPD_ID}
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
