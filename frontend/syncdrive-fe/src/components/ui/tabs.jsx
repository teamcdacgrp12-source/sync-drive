import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root
function TabsList({ className, ...props }) { return <TabsPrimitive.List className={cn("inline-flex rounded-lg bg-slate-100 p-1", className)} {...props} /> }
function TabsTrigger({ className, ...props }) { return <TabsPrimitive.Tab className={cn("rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition data-active:bg-white data-active:text-slate-900 data-active:shadow-sm", className)} {...props} /> }
function TabsContent({ className, ...props }) { return <TabsPrimitive.Panel className={cn("mt-4 outline-none", className)} {...props} /> }
export { Tabs, TabsList, TabsTrigger, TabsContent }
