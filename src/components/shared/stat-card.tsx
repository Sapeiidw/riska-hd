import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconBgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBgColor = "bg-gradient-to-br from-sky-400 to-cyan-500",
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn("bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group", className)}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {Icon && (
          <div className={cn("size-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform", iconBgColor)}>
            <Icon className="text-white h-6 w-6" />
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      {description && (
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      )}
      {trend && (
        <p
          className={cn(
            "text-sm mt-2 font-medium",
            trend.isPositive ? "text-emerald-500" : "text-rose-500"
          )}
        >
          {trend.isPositive ? "+" : "-"}
          {Math.abs(trend.value)}% dari bulan lalu
        </p>
      )}
    </div>
  );
}
