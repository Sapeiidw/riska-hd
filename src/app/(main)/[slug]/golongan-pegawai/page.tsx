"use client";

import { FormGolonganPegawai } from "@/components/form/golongan-pegawai";
import { CrudPage, GolonganPegawai, useOpdBySlug } from "@/lib/opd";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

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
    <CrudPage<GolonganPegawai>
      opdId={opd.id}
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
