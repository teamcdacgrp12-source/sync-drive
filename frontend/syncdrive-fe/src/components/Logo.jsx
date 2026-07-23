import { Clapperboard } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 font-semibold text-slate-950 ${className}`}>
      <span className="grid size-9 place-items-center rounded-lg bg-indigo-600 text-white">
        <Clapperboard size={19} aria-hidden="true" />
      </span>
      <span>SyncDrive</span>
    </Link>
  )
}
