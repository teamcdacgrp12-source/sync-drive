import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const DropdownMenu = MenuPrimitive.Root
const DropdownMenuTrigger = MenuPrimitive.Trigger
const DropdownMenuGroup = MenuPrimitive.Group
const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup
const DropdownMenuSub = MenuPrimitive.SubmenuRoot
function DropdownMenuContent({ className, sideOffset = 6, ...props }) { return <MenuPrimitive.Portal><MenuPrimitive.Positioner sideOffset={sideOffset} className="z-50"><MenuPrimitive.Popup className={cn("min-w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg", className)} {...props} /></MenuPrimitive.Positioner></MenuPrimitive.Portal> }
function DropdownMenuItem({ className, inset, ...props }) { return <MenuPrimitive.Item className={cn("flex cursor-default items-center rounded-md px-2 py-1.5 text-sm text-slate-700 outline-none hover:bg-slate-100 focus:bg-slate-100 data-disabled:opacity-50", inset && "pl-8", className)} {...props} /> }
function DropdownMenuLabel({ className, ...props }) { return <MenuPrimitive.GroupLabel className={cn("px-2 py-1.5 text-xs font-semibold text-slate-500", className)} {...props} /> }
function DropdownMenuSeparator({ className, ...props }) { return <MenuPrimitive.Separator className={cn("my-1 h-px bg-slate-200", className)} {...props} /> }
function DropdownMenuCheckboxItem({ className, children, ...props }) { return <MenuPrimitive.CheckboxItem className={cn("flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100", className)} {...props}><MenuPrimitive.CheckboxItemIndicator><Check className="size-4" /></MenuPrimitive.CheckboxItemIndicator>{children}</MenuPrimitive.CheckboxItem> }
function DropdownMenuRadioItem({ className, children, ...props }) { return <MenuPrimitive.RadioItem className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100" {...props}><MenuPrimitive.RadioItemIndicator><Check className="size-4" /></MenuPrimitive.RadioItemIndicator>{children}</MenuPrimitive.RadioItem> }
function DropdownMenuSubTrigger({ className, children, ...props }) { return <MenuPrimitive.SubmenuTrigger className="flex cursor-default items-center rounded-md px-2 py-1.5 text-sm hover:bg-slate-100" {...props}>{children}<ChevronRight className="ml-auto size-4" /></MenuPrimitive.SubmenuTrigger> }
const DropdownMenuSubContent = DropdownMenuContent
function DropdownMenuShortcut({ className, ...props }) { return <span className={cn("ml-auto text-xs text-slate-400", className)} {...props} /> }
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuShortcut }
