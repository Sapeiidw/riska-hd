"use client";
import { getChartColors } from "@/lib/utils";
import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from "chart.js";
import { useTheme } from "next-themes";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface ChartRecord {
  label: string;
  [key: string]: string | number;
}

interface ChartProps {
  title?: string;
  data: ChartRecord[];
  field: string; // which field to show in pie (e.g. "berhasil" or "tidak")
}

export default function PieChartCustom({ title, data, field }: ChartProps) {
  const { theme } = useTheme();

  // Theme-based palettes
  const baseColors = getChartColors(theme);
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: field,
        data: data.map((d) => Number(d[field] ?? 0)),
        backgroundColor: data.map(
          (_, i) => baseColors[i % baseColors.length] + "cc"
        ),
        borderColor: data.map((_, i) => baseColors[i % baseColors.length]),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right" as const },
      title: title ? { display: true, text: title } : { display: false },
      tooltip: { mode: "index" as const, intersect: false },
    },
  };

  return (
    <div className="w-full h-full">
      <Pie data={chartData} options={options} />
    </div>
  );
}
