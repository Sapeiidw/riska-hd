"use client";

import { FormKenaikanPangkat } from "@/components/form/kenaikan-pangkat";
import { CrudPage, KenaikanPangkat } from "@/lib/opd";

const OPD_ID = 10;

const columns = [{ key: "value", title: "Jumlah" }];

const defaultData = {
  value: 0,
};

export default function Page() {
  return (
    <CrudPage<KenaikanPangkat>
      opdId={OPD_ID}
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
