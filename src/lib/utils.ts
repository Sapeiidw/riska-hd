import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// utils/chartColors.ts
export const LIGHT_COLORS = [
  "#8b5cf6", // violet-500
  "#14b8a6", // teal-500
  "#f472b6", // pink-400
  "#f59e0b", // amber-500
  "#d946ef", // fuchsia-500
];

export const DARK_COLORS = [
  "#a78bfa", // violet-400
  "#2dd4bf", // teal-400
  "#f9a8d4", // pink-300
  "#fbbf24", // amber-400
  "#e879f9", // fuchsia-400
];

/**
 * Pick the base palette depending on theme
 */
export function getChartColors(theme?: string) {
  return theme === "dark" ? DARK_COLORS : LIGHT_COLORS;
}
