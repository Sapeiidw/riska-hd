"use client";

import { FormGolonganPegawai } from "@/components/form/golongan-pegawai";
import { CrudPage, GolonganPegawai } from "@/lib/opd";

const OPD_ID = 5;

const columns = [
  { key: "golongan_i", title: "Golongan I" },
  { key: "golongan_ii", title: "Golongan II" },
  { key: "golongan_iii", title: "Golongan III" },
  { key: "golongan_iv", title: "Golongan IV" },
];

const defaultData = {
  golongan_i: 0,
  golongan_ii: 0,
  golongan_iii: 0,
  golongan_iv: 0,
};

export default function Page() {
  return (
    <CrudPage<GolonganPegawai>
      opdId={OPD_ID}
      title="Golongan Pegawai"
      description="Tambahkan data golongan pegawai"
      apiEndpoint="golongan-pegawai"
      queryKey="golongan-pegawai"
      columns={columns}
      defaultData={defaultData}
      FormComponent={FormGolonganPegawai}
    />
  );
}
