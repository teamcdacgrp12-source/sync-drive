import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function EditProfileForm({ profile, onSave, saving }) {
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')

  useEffect(() => {
    setDisplayName(profile?.displayName ?? '')
  }, [profile?.displayName])

  const submit = (event) => {
    event.preventDefault()
    onSave({ displayName: displayName.trim() })
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="display-name">Display name</Label>
        <Input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder={profile?.username} maxLength={80} required />
        <p className="text-sm text-slate-500">This name appears to people in your rooms.</p>
      </div>
      <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
    </form>
  )
}
