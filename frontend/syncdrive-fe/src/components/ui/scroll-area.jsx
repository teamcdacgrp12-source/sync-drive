import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import { cn } from "@/lib/utils"

function ScrollArea({ className, children, ...props }) { return <ScrollAreaPrimitive.Root className={cn("relative overflow-hidden", className)} {...props}><ScrollAreaPrimitive.Viewport className="size-full">{children}</ScrollAreaPrimitive.Viewport><ScrollBar /></ScrollAreaPrimitive.Root> }
function ScrollBar({ className, orientation = "vertical", ...props }) { return <ScrollAreaPrimitive.Scrollbar orientation={orientation} className={cn("flex touch-none p-0.5", orientation === "vertical" ? "h-full w-2.5" : "h-2.5 flex-col", className)} {...props}><ScrollAreaPrimitive.Thumb className="flex-1 rounded-full bg-slate-300" /></ScrollAreaPrimitive.Scrollbar> }
export { ScrollArea, ScrollBar }
