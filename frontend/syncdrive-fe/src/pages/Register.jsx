import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/useAuth'

const initialAccount = { username: '', email: '', password: '', confirmPassword: '' }

export default function Register() {
  const [account, setAccount] = useState(initialAccount)
  const [validationError, setValidationError] = useState(null)
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()

  const updateField = ({ target: { name, value } }) => {
    setAccount((current) => ({ ...current, [name]: value }))
    setValidationError(null)
  }

  const submit = async (event) => {
    event.preventDefault()

    if (account.password !== account.confirmPassword) {
      setValidationError('Passwords do not match.')
      return
    }

    const { confirmPassword, ...registration } = account
    const result = await register(registration)

    if (result) navigate('/login', { replace: true, state: { registered: true } })
  }

  const message = validationError ?? error

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
        <Logo className="mb-8" />
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">Start hosting watch parties in a few moments.</p>
        <form className="mt-7 space-y-5" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="register-username">Username</Label>
            <Input id="register-username" name="username" autoComplete="username" value={account.username} onChange={updateField} required minLength={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" value={account.email} onChange={updateField} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input id="register-password" name="password" type="password" autoComplete="new-password" value={account.password} onChange={updateField} required minLength={8} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" value={account.confirmPassword} onChange={updateField} required minLength={8} />
          </div>
          {message && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{message}</p>}
          <Button className="w-full" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link className="font-medium text-indigo-600 hover:text-indigo-700" to="/login">Sign in</Link></p>
      </div>
    </div>
  )
}
