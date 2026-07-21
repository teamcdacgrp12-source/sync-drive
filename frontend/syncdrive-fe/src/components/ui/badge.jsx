import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", {
  variants: {
    variant: {
      default: "border-transparent bg-indigo-600 text-white",
      secondary: "border-transparent bg-slate-100 text-slate-700",
      outline: "border-slate-300 text-slate-700",
      destructive: "border-transparent bg-red-600 text-white",
    },
  },
  defaultVariants: { variant: "default" },
})

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { Badge, badgeVariants }
