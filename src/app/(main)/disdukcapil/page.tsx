"use client";

import { useMemo, useState } from "react";
import BarChartCustom from "@/components/chart/BarChart";
import LineChartCustom from "@/components/chart/LineChart";
import PieChartCustom from "@/components/chart/PieChart";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { DataTable } from "@/components/data-table/data-table";
import { MonthPicker } from "@/components/month-picker";
import { YearPicker } from "@/components/year-picker";
import { ColumnDef } from "@tanstack/react-table";
import {
  useKenaikanPangkat,
  useStatusDokumen,
  useStatusKenaikanPangkat,
  useStatusSKKenaikanPangkat,
  useGolonganPegawai,
  useStatusPegawai,
} from "./_lib";

interface StatusPegawaiRow {
  periode: string;
  nama_opd: string;
  nama: string;
  nip: string;
  golongan: string;
  status: string;
  keterangan: string;
}

const columns: ColumnDef<StatusPegawaiRow>[] = [
  {
    accessorKey: "tahun",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tahun" />
    ),
    cell: ({ row }) => new Date(row.getValue("periode")).getFullYear(),
  },
  {
    accessorKey: "periode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bulan" />
    ),
    cell: ({ row }) =>
      new Date(row.getValue("periode")).toLocaleDateString("id-ID", {
        month: "long",
      }),
  },
  {
    accessorKey: "nama_opd",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama OPD" />
    ),
  },
  {
    accessorKey: "nama",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama" />
    ),
  },
  {
    accessorKey: "nip",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NIP" />
    ),
  },
  {
    accessorKey: "golongan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Golongan" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  },
  {
    accessorKey: "keterangan",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Keterangan" />
    ),
  },
];

export default function Page() {
  const [year, setYear] = useState(() => new Date().getFullYear().toString());
  const [month, setMonth] = useState(() =>
    (new Date().getMonth() + 1).toString()
  );

  const { data: dataKenaikanPangkat } = useKenaikanPangkat(year);
  const { data: dataStatusDokumen } = useStatusDokumen(year);
  const { data: dataStatusKenaikanPangkat } = useStatusKenaikanPangkat(year, month);
  const { data: dataStatusSKKenaikanPangkat } = useStatusSKKenaikanPangkat(year, month);
  const { data: dataGolonganPegawai } = useGolonganPegawai(year, month);
  const { data: dataStatusPegawai } = useStatusPegawai(year, month);

  const pieChartData = useMemo(
    () => ({
      golongan: dataGolonganPegawai ?? [],
      statusKenaikan: dataStatusKenaikanPangkat ?? [],
      statusSK: dataStatusSKKenaikanPangkat ?? [],
    }),
    [dataGolonganPegawai, dataStatusKenaikanPangkat, dataStatusSKKenaikanPangkat]
  );

  return (
    <>
      <div className="col-span-full bg-white flex justify-between items-center p-4 rounded-2xl shadow">
        <h1 className="text-lg">Tahunan</h1>
        <YearPicker value={year} onChange={setYear} />
      </div>

      <div className="w-full h-96 col-span-full bg-white p-4 rounded-2xl shadow">
        {dataKenaikanPangkat && (
          <LineChartCustom
            title="Jumlah Kenaikan Pangkat Pegawai"
            data={dataKenaikanPangkat}
          />
        )}
      </div>

      <div className="w-full h-96 col-span-full bg-white p-4 rounded-2xl shadow">
        {dataStatusDokumen && (
          <BarChartCustom
            title="Status Dokumen Per Bulan"
            data={dataStatusDokumen}
          />
        )}
      </div>

      <div className="col-span-full bg-white flex items-center p-4 rounded-2xl shadow">
        <h1 className="text-lg">Bulanan</h1>
        <MonthPicker value={month} onChange={setMonth} className="ml-auto" />
        <YearPicker value={year} onChange={setYear} />
      </div>

      <div className="w-full h-100 col-span-4 flex justify-center items-center bg-white p-4 rounded-2xl shadow">
        <PieChartCustom
          title="Golongan Pegawai"
          data={pieChartData.golongan}
          field="value"
        />
      </div>

      <div className="w-full h-100 col-span-4 flex justify-center items-center bg-white p-4 rounded-2xl shadow">
        <PieChartCustom
          title="Status Kenaikan Pangkat"
          data={pieChartData.statusKenaikan}
          field="value"
        />
      </div>

      <div className="w-full h-100 col-span-4 flex justify-center items-center bg-white p-4 rounded-2xl shadow">
        <PieChartCustom
          title="Status SK Kenaikan Pangkat"
          data={pieChartData.statusSK}
          field="value"
        />
      </div>

      <div className="w-full col-span-full flex flex-col bg-white p-4 rounded-2xl shadow">
        <h1>Status Pegawai</h1>
        {dataStatusPegawai && (
          <DataTable columns={columns} data={dataStatusPegawai} />
        )}
      </div>
    </>
  );
}
