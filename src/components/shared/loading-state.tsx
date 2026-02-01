import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function LoadingState({
  message = "Memuat data...",
  className,
  size = "md",
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 bg-white rounded-3xl shadow-lg border border-gray-100",
        className
      )}
    >
      <div className="size-16 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
        <Loader2 className={cn("text-white animate-spin", sizeClasses[size])} />
      </div>
      {message && (
        <p className="text-gray-500 mt-5 text-sm">{message}</p>
      )}
    </div>
  );
}

export function LoadingSpinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Loader2
      className={cn("text-sky-500 animate-spin", sizeClasses[size], className)}
    />
  );
}
