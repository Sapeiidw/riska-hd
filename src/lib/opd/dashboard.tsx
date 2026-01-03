"use client";

import { useMemo, useState } from "react";
import BarChartCustom from "@/components/chart/BarChart";
import LineChartCustom from "@/components/chart/LineChart";
import PieChartCustom from "@/components/chart/PieChart";
import { DataTable } from "@/components/data-table/data-table";
import { MonthPicker } from "@/components/month-picker";
import { YearPicker } from "@/components/year-picker";
import {
  useKenaikanPangkat,
  useStatusDokumen,
  useStatusKenaikanPangkat,
  useStatusSKKenaikanPangkat,
  useGolonganPegawai,
  useStatusPegawai,
} from "./hooks";
import { statusPegawaiColumns } from "./columns";

interface OpdDashboardProps {
  opdId: number;
}

export function OpdDashboard({ opdId }: OpdDashboardProps) {
  const [year, setYear] = useState(() => new Date().getFullYear().toString());
  const [month, setMonth] = useState(() =>
    (new Date().getMonth() + 1).toString()
  );

  const { data: dataKenaikanPangkat } = useKenaikanPangkat(opdId, year);
  const { data: dataStatusDokumen } = useStatusDokumen(opdId, year);
  const { data: dataStatusKenaikanPangkat } = useStatusKenaikanPangkat(
    opdId,
    year,
    month
  );
  const { data: dataStatusSKKenaikanPangkat } = useStatusSKKenaikanPangkat(
    opdId,
    year,
    month
  );
  const { data: dataGolonganPegawai } = useGolonganPegawai(opdId, year, month);
  const { data: dataStatusPegawai } = useStatusPegawai(opdId, year, month);

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
      {/* Tahunan Section Header */}
      <div className="col-span-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 flex justify-between items-center p-5 rounded-2xl shadow-lg shadow-purple-500/20">
        <h1 className="text-lg font-bold text-white">Data Tahunan</h1>
        <YearPicker value={year} onChange={setYear} />
      </div>

      {/* Line Chart */}
      <div className="w-full h-96 col-span-full bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col">
        <h2 className="text-lg font-bold text-gray-800 mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
          Jumlah Kenaikan Pangkat Pegawai
        </h2>
        <div className="flex-1 min-h-0">
          {dataKenaikanPangkat && (
            <LineChartCustom data={dataKenaikanPangkat} />
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="w-full h-96 col-span-full bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col">
        <h2 className="text-lg font-bold text-gray-800 mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
          Status Dokumen Per Bulan
        </h2>
        <div className="flex-1 min-h-0">
          {dataStatusDokumen && <BarChartCustom data={dataStatusDokumen} />}
        </div>
      </div>

      {/* Bulanan Section Header */}
      <div className="col-span-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 flex items-center p-5 rounded-2xl shadow-lg shadow-teal-500/20">
        <h1 className="text-lg font-bold text-white">Data Bulanan</h1>
        <MonthPicker value={month} onChange={setMonth} className="ml-auto" />
        <YearPicker value={year} onChange={setYear} />
      </div>

      {/* Pie Charts */}
      <div className="w-full h-100 col-span-4 flex flex-col bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-md font-bold text-gray-800 mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
          Golongan Pegawai
        </h2>
        <div className="flex-1 flex justify-center items-center">
          <PieChartCustom data={pieChartData.golongan} field="value" />
        </div>
      </div>

      <div className="w-full h-100 col-span-4 flex flex-col bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-md font-bold text-gray-800 mb-4 bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
          Status Kenaikan Pangkat
        </h2>
        <div className="flex-1 flex justify-center items-center">
          <PieChartCustom data={pieChartData.statusKenaikan} field="value" />
        </div>
      </div>

      <div className="w-full h-100 col-span-4 flex flex-col bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-md font-bold text-gray-800 mb-4 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
          Status SK Kenaikan Pangkat
        </h2>
        <div className="flex-1 flex justify-center items-center">
          <PieChartCustom data={pieChartData.statusSK} field="value" />
        </div>
      </div>

      {/* Data Table */}
      <div className="w-full col-span-full flex flex-col bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
          Status Pegawai
        </h2>
        {dataStatusPegawai && (
          <DataTable columns={statusPegawaiColumns} data={dataStatusPegawai} />
        )}
      </div>
    </>
  );
}
