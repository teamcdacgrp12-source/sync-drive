import { AlertDialog as AlertPrimitive } from "@base-ui/react/alert-dialog"
import { cn } from "@/lib/utils"

const AlertDialog = AlertPrimitive.Root
const AlertDialogTrigger = AlertPrimitive.Trigger
const AlertDialogCancel = AlertPrimitive.Close

function AlertDialogContent({ className, ...props }) { return <AlertPrimitive.Portal><AlertPrimitive.Backdrop className="fixed inset-0 z-50 bg-slate-950/45" /><AlertPrimitive.Popup className={cn("fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl", className)} {...props} /></AlertPrimitive.Portal> }
function AlertDialogHeader({ className, ...props }) { return <div className={cn("space-y-2", className)} {...props} /> }
function AlertDialogFooter({ className, ...props }) { return <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} /> }
function AlertDialogTitle({ className, ...props }) { return <AlertPrimitive.Title className={cn("text-lg font-semibold text-slate-900", className)} {...props} /> }
function AlertDialogDescription({ className, ...props }) { return <AlertPrimitive.Description className={cn("text-sm text-slate-500", className)} {...props} /> }
function AlertDialogAction({ className, ...props }) { return <button className={cn("rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700", className)} {...props} /> }

export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel }
