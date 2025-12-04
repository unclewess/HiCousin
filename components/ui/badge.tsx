import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-gradient-to-r from-cousin-green to-emerald-500 text-white hover:shadow-md",
        warning:
          "border-transparent bg-gradient-to-r from-cousin-orange to-amber-500 text-white hover:shadow-md",
        error:
          "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-md",
        info:
          "border-transparent bg-gradient-to-r from-cousin-blue to-blue-500 text-white hover:shadow-md",
        gradient:
          "border-transparent bg-gradient-to-r from-cousin-purple to-cousin-pink text-white hover:shadow-md",
        pending:
          "border-transparent bg-gradient-to-r from-cousin-orange to-cousin-pink text-white hover:shadow-md animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
