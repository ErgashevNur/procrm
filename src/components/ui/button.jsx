import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(180deg,rgba(127,179,255,0.95),rgba(84,143,255,0.95))] text-white shadow-[0_16px_34px_rgba(79,128,255,0.32)] hover:brightness-105",
        destructive:
          "border-white/8 bg-[linear-gradient(180deg,rgba(255,105,97,0.92),rgba(255,69,58,0.9))] text-white shadow-[0_16px_34px_rgba(255,69,58,0.24)] hover:brightness-105 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "crm-control text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/16 hover:bg-white/[0.08]",
        secondary:
          "border-white/8 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-white/[0.12]",
        ghost:
          "text-[color:var(--crm-muted)] hover:border-white/8 hover:bg-white/[0.06] hover:text-white",
        link: "text-[color:var(--crm-accent-2)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        xs: "h-7 gap-1 rounded-full px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-3.5 has-[>svg]:px-3",
        lg: "h-11 px-6 has-[>svg]:px-4",
        icon: "size-10",
        "icon-xs": "size-7 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
