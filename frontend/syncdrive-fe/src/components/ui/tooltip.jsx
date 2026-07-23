import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
function TooltipContent({ className, sideOffset = 6, ...props }) { return <TooltipPrimitive.Portal><TooltipPrimitive.Positioner sideOffset={sideOffset} className="z-50"><TooltipPrimitive.Popup className={cn("rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-md", className)} {...props} /></TooltipPrimitive.Positioner></TooltipPrimitive.Portal> }
export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }
