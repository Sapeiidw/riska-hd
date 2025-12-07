"use client";

import { FormStatusDokumenWajib } from "@/components/form/status-dokumen-wajib";
import { CrudPage, StatusDokumenWajib } from "../_lib";

const columns = [
  { key: "berhasil", title: "Berhasil", type: "numeric" as const },
  { key: "tidak_berhasil", title: "Tidak Berhasil", type: "numeric" as const },
];

const defaultData = {
  berhasil: 0,
  tidak_berhasil: 0,
};

export default function Page() {
  return (
    <CrudPage<StatusDokumenWajib>
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
