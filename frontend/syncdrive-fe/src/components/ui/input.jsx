import { cn } from "@/lib/utils"

function Input({ className, type = "text", ...props }) {
  return <input type={type} className={cn("flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />
}

export { Input }
