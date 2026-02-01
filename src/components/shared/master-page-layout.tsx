"use client";

import { ReactNode } from "react";
import { Search, Plus, LucideIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StatItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: "default" | "success" | "warning" | "danger";
}

interface MasterPageLayoutProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  stats?: StatItem[];
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  addButtonLabel?: string;
  onAddClick?: () => void;
  extraActions?: ReactNode;
  children: ReactNode;
}

const colorClasses = {
  default: "bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-lg shadow-sky-500/30",
  success: "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30",
  warning: "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30",
  danger: "bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-lg shadow-rose-500/30",
};

export function MasterPageLayout({
  title,
  description,
  icon: Icon,
  stats,
  searchPlaceholder = "Cari...",
  searchValue,
  onSearchChange,
  addButtonLabel = "Tambah Data",
  onAddClick,
  extraActions,
  children,
}: MasterPageLayoutProps) {
  return (
    <div className="col-span-12 space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 shadow-lg shadow-sky-500/30">
                <Icon className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-800">{title}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            </div>
          </div>
          {onAddClick && (
            <Button onClick={onAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              {addButtonLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500 truncate">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-800 mt-2 tabular-nums">
                    {stat.value}
                  </p>
                </div>
                {stat.icon && (
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl group-hover:scale-110 transition-transform ${colorClasses[stat.color || "default"]}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Card */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        {(onSearchChange || extraActions) && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            {onSearchChange && (
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-11"
                />
              </div>
            )}
            {extraActions && <div className="flex items-center gap-2">{extraActions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
