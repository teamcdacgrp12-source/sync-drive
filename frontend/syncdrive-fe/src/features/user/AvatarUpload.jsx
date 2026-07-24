import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import Avatar from '@/components/Avatar'
import { Button } from '@/components/ui/button'

const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxFileSize = 5 * 1024 * 1024

export default function AvatarUpload({ profile, onUpload, uploading }) {
  const inputRef = useRef(null)
  const [error, setError] = useState(null)

  const selectFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (!acceptedTypes.includes(file.type) || file.size > maxFileSize) {
      setError('Choose a JPG, PNG, or WebP image smaller than 5 MB.')
      return
    }

    setError(null)
    await onUpload(file)
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar user={profile} size="lg" />
      <div>
        <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectFile} />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Camera size={16} aria-hidden="true" />
          {uploading ? 'Uploading…' : 'Change avatar'}
        </Button>
        <p className="mt-2 text-sm text-slate-500">JPG, PNG, or WebP. Maximum 5 MB.</p>
        {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
      </div>
    </div>
  )
}
