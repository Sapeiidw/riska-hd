"use client";

import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  variant?: "default" | "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  animated?: boolean;
}

export function Logo({
  className = "",
  variant = "default",
  size = "md",
  showTagline = false,
  animated = false,
}: LogoProps) {
  const sizes = {
    sm: { text: "text-lg", icon: "size-5", tagline: "text-[8px]" },
    md: { text: "text-2xl", icon: "size-6", tagline: "text-[10px]" },
    lg: { text: "text-3xl", icon: "size-8", tagline: "text-xs" },
    xl: { text: "text-5xl", icon: "size-12", tagline: "text-sm" },
  };

  const colors = {
    default: {
      riska: "text-sky-500",
      hd: "text-rose-400",
      icon: "from-sky-400 to-cyan-400",
      iconAccent: "bg-rose-400",
      tagline: "text-gray-400",
    },
    light: {
      riska: "text-white",
      hd: "text-white/80",
      icon: "from-white/90 to-white/70",
      iconAccent: "bg-white/60",
      tagline: "text-white/60",
    },
    dark: {
      riska: "text-gray-800",
      hd: "text-rose-500",
      icon: "from-sky-500 to-cyan-500",
      iconAccent: "bg-rose-500",
      tagline: "text-gray-500",
    },
  };

  const s = sizes[size];
  const c = colors[variant];

  const Wrapper = animated ? motion.div : "div";
  const wrapperProps = animated
    ? {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      }
    : {};

  return (
    <Wrapper className={`flex items-center gap-2 ${className}`} {...wrapperProps}>
      {/* Icon */}
      <div className="relative">
        <div
          className={`${s.icon} rounded-xl bg-gradient-to-br ${c.icon} flex items-center justify-center shadow-lg`}
        >
          {/* Heart/Pulse Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-[60%] h-[60%]"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M3 12h4l3-9 4 18 3-9h4"
              className={variant === "light" ? "stroke-sky-500" : "stroke-white"}
            />
          </svg>
        </div>
        {/* Accent dot */}
        <div
          className={`absolute -top-0.5 -right-0.5 size-2 rounded-full ${c.iconAccent} shadow-sm`}
        />
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <div className={`${s.text} font-bold tracking-tight leading-none flex items-baseline`}>
          <span className={c.riska}>RISKA</span>
          <span className={`${c.hd} ml-1`}>HD</span>
        </div>
        {showTagline && (
          <span className={`${s.tagline} ${c.tagline} tracking-wide mt-0.5`}>
            Hemodialisa Terpadu
          </span>
        )}
      </div>
    </Wrapper>
  );
}

// Alternative: Icon only version
export function LogoIcon({
  className = "",
  variant = "default",
  size = "md",
}: Omit<LogoProps, "showTagline">) {
  const sizes = {
    sm: "size-8",
    md: "size-10",
    lg: "size-14",
    xl: "size-20",
  };

  const colors = {
    default: {
      icon: "from-sky-400 to-cyan-400",
      iconAccent: "bg-rose-400",
    },
    light: {
      icon: "from-white/90 to-white/70",
      iconAccent: "bg-white/60",
    },
    dark: {
      icon: "from-sky-500 to-cyan-500",
      iconAccent: "bg-rose-500",
    },
  };

  const s = sizes[size];
  const c = colors[variant];

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${s} rounded-2xl bg-gradient-to-br ${c.icon} flex items-center justify-center shadow-xl`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-[55%] h-[55%]"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M3 12h4l3-9 4 18 3-9h4"
            className={variant === "light" ? "stroke-sky-500" : "stroke-white"}
          />
        </svg>
      </div>
      <div
        className={`absolute -top-1 -right-1 size-3 rounded-full ${c.iconAccent} shadow-sm border-2 border-white`}
      />
    </div>
  );
}
