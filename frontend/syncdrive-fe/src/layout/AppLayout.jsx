import { LogIn, Plus, UserRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import Logo from '@/components/Logo'

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
  }`

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="page-container flex min-h-16 items-center justify-between gap-4">
          <Logo />
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            <NavLink className={navLinkClass} to="/rooms">
              <Plus size={16} aria-hidden="true" />
              Rooms
            </NavLink>
            <NavLink className={navLinkClass} to="/profile">
              <UserRound size={16} aria-hidden="true" />
              Profile
            </NavLink>
            <NavLink className={navLinkClass} to="/login">
              <LogIn size={16} aria-hidden="true" />
              Sign in
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="page-container py-8">
        <Outlet />
      </main>
    </div>
  )
}
