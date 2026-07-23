import { Toaster as Sonner } from "sonner"

function Toaster(props) {
  return <Sonner theme="light" richColors closeButton toastOptions={{ classNames: { toast: "border border-slate-200 shadow-lg" } }} {...props} />
}

export { Toaster }
