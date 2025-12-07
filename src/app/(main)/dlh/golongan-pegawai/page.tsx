"use client";

import { FormGolonganPegawai } from "@/components/form/golongan-pegawai";
import { CrudPage, GolonganPegawai } from "../_lib";

const columns = [
  { key: "golongan_i", title: "Golongan I", type: "numeric" as const },
  { key: "golongan_ii", title: "Golongan II", type: "numeric" as const },
  { key: "golongan_iii", title: "Golongan III", type: "numeric" as const },
  { key: "golongan_iv", title: "Golongan IV", type: "numeric" as const },
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
