import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-sky-100 text-sky-700 [a&]:hover:bg-sky-200",
        secondary:
          "border-transparent bg-gray-100 text-gray-600 [a&]:hover:bg-gray-200",
        destructive:
          "border-transparent bg-rose-100 text-rose-700 [a&]:hover:bg-rose-200 focus-visible:ring-rose/20",
        outline:
          "border-gray-200 bg-white text-gray-700 [a&]:hover:bg-gray-50",
        success:
          "border-transparent bg-emerald-100 text-emerald-700 [a&]:hover:bg-emerald-200",
        warning:
          "border-transparent bg-amber-100 text-amber-700 [a&]:hover:bg-amber-200",
        info:
          "border-transparent bg-cyan-100 text-cyan-700 [a&]:hover:bg-cyan-200",
        purple:
          "border-transparent bg-violet-100 text-violet-700 [a&]:hover:bg-violet-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
