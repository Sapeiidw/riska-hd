import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { InboxIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl shadow-lg border border-gray-100",
        className
      )}
    >
      <div className="size-16 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
        <Icon className="text-white h-8 w-8" />
      </div>
      <h3 className="mt-5 text-xl font-bold text-gray-800">{title}</h3>
      {description && (
        <p className="text-gray-500 mt-2 max-w-sm text-sm">
          {description}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
