import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from '@/components/Logo'
import Loader from '@/components/Loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/useAuth'

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destination = location.state?.from?.pathname ?? '/'

  const updateField = ({ target: { name, value } }) => {
    setCredentials((current) => ({ ...current, [name]: value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const user = await login(credentials)

    if (user) navigate(destination, { replace: true })
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <Logo className="mb-8" />
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to join your watch party.</p>
        <form className="mt-7 space-y-5" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" autoComplete="username" value={credentials.username} onChange={updateField} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" value={credentials.password} onChange={updateField} required />
          </div>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          <Button className="w-full" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
        </form>
        {loading && <Loader label="Signing you in" />}
        <p className="mt-6 text-center text-sm text-slate-600">New to SyncDrive? <Link className="font-medium text-indigo-600 hover:text-indigo-700" to="/register">Create an account</Link></p>
      </div>
    </div>
  )
}
