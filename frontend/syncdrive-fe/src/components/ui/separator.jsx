import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cn } from "@/lib/utils"

function Separator({ className, orientation = "horizontal", ...props }) { return <SeparatorPrimitive orientation={orientation} className={cn("shrink-0 bg-slate-200", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)} {...props} /> }
export { Separator }
