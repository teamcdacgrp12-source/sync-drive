import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

function DialogContent({ className, children, ...props }) {
  return <DialogPrimitive.Portal><DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-slate-950/45" /><DialogPrimitive.Popup className={cn("fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl", className)} {...props}>{children}<DialogClose className="absolute right-3 top-3 rounded-md p-1 text-slate-500 hover:bg-slate-100"><X className="size-4" /><span className="sr-only">Close</span></DialogClose></DialogPrimitive.Popup></DialogPrimitive.Portal>
}

function DialogHeader({ className, ...props }) { return <div className={cn("space-y-1.5", className)} {...props} /> }
function DialogFooter({ className, ...props }) { return <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} /> }
function DialogTitle({ className, ...props }) { return <DialogPrimitive.Title className={cn("text-lg font-semibold text-slate-900", className)} {...props} /> }
function DialogDescription({ className, ...props }) { return <DialogPrimitive.Description className={cn("text-sm text-slate-500", className)} {...props} /> }

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription }
