"use client";

import { FormStatusPegawai } from "@/components/form/status-pegawai";
import { CrudPage, StatusPegawai } from "@/lib/opd";

const OPD_ID = 14;

const columns = [
  { key: "nama", title: "Nama", type: "text" as const },
  { key: "nip", title: "NIP", type: "text" as const },
  { key: "golongan", title: "Golongan", type: "text" as const },
  { key: "status", title: "Status", type: "text" as const },
  { key: "keterangan", title: "Keterangan", type: "text" as const },
];

const defaultData = {
  nama: "",
  nip: "",
  golongan: "",
  status: "",
  keterangan: "",
};

export default function Page() {
  return (
    <CrudPage<StatusPegawai>
      opdId={OPD_ID}
      title="Status Pegawai"
      description="Tambahkan data status pegawai"
      apiEndpoint="status-pegawai"
      queryKey="status-pegawai"
      columns={columns}
      defaultData={defaultData}
      FormComponent={FormStatusPegawai}
    />
  );
}
