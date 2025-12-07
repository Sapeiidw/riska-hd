"use client";

import { FormKenaikanPangkat } from "@/components/form/kenaikan-pangkat";
import { CrudPage, KenaikanPangkat } from "../_lib";

const columns = [{ key: "value", title: "Jumlah" }];

const defaultData = {
  value: 0,
};

export default function Page() {
  return (
    <CrudPage<KenaikanPangkat>
      title="Kenaikan Pangkat"
      description="Tambahkan data kenaikan pangkat"
      apiEndpoint="kenaikan-pangkat"
      queryKey="kenaikan-pangkat"
      columns={columns}
      defaultData={defaultData}
      FormComponent={FormKenaikanPangkat}
    />
  );
}
