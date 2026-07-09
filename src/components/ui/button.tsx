"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useReadOnly } from "@/contexts/ReadOnlyContext"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-white/20 backdrop-blur-xl border border-white/40 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-white/30 active:scale-95 active:bg-white/40 rounded-full font-bold transition-all duration-200",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-white/20 bg-transparent shadow-sm hover:bg-white/10 active:scale-95 active:bg-white/20 text-white rounded-full transition-all duration-200 backdrop-blur-md",
        secondary:
          "bg-white/5 text-white border border-white/10 shadow-sm hover:bg-white/10 active:scale-95 active:bg-white/20 rounded-full backdrop-blur-xl transition-all duration-200",
        ghost:
          "hover:bg-white/10 active:scale-95 active:bg-white/20 text-white rounded-full transition-all duration-200 backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
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
  variant,
  size,
  asChild = false,
  ignoreReadOnly = false,
  disabled,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    ignoreReadOnly?: boolean
  }) {
  const { isReadOnly } = useReadOnly()
  const Comp = asChild ? Slot : "button"
  const isDisabled = disabled || (!ignoreReadOnly && isReadOnly)

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      {...props}
    />
  )
}

export { Button, buttonVariants }
