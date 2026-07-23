import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

function Switch({ className, ...props }) {
  return <SwitchPrimitive.Root className={cn("relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition data-checked:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50", className)} {...props}><SwitchPrimitive.Thumb className="size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-checked:translate-x-5" /></SwitchPrimitive.Root>
}

export { Switch }
