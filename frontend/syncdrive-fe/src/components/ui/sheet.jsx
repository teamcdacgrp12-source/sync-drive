import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
function SheetContent({ className, children, side = "right", ...props }) { const positions = { top: "inset-x-0 top-0 border-b", right: "inset-y-0 right-0 h-full w-3/4 max-w-md border-l", bottom: "inset-x-0 bottom-0 border-t", left: "inset-y-0 left-0 h-full w-3/4 max-w-md border-r" }; return <DialogPrimitive.Portal><DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-slate-950/45" /><DialogPrimitive.Popup className={cn("fixed z-50 bg-white p-6 shadow-xl", positions[side], className)} {...props}>{children}<SheetClose className="absolute right-3 top-3 rounded-md p-1 text-slate-500 hover:bg-slate-100"><X className="size-4" /><span className="sr-only">Close</span></SheetClose></DialogPrimitive.Popup></DialogPrimitive.Portal> }
function SheetHeader({ className, ...props }) { return <div className={cn("space-y-1.5", className)} {...props} /> }
function SheetFooter({ className, ...props }) { return <div className={cn("mt-6 flex flex-col gap-2", className)} {...props} /> }
function SheetTitle({ className, ...props }) { return <DialogPrimitive.Title className={cn("text-lg font-semibold", className)} {...props} /> }
function SheetDescription({ className, ...props }) { return <DialogPrimitive.Description className={cn("text-sm text-slate-500", className)} {...props} /> }
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription }
