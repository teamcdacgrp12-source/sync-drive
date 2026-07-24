import { AtSign } from 'lucide-react'
import Avatar from '@/components/Avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProfileCard({ profile }) {
  const displayName = profile?.displayName || profile?.username || 'SyncDrive member'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Public profile</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-5">
        <Avatar user={profile} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold text-slate-950">{displayName}</p>
          {profile?.username && <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500"><AtSign size={14} aria-hidden="true" />{profile.username}</p>}
          <p className="mt-3 text-sm text-slate-500">This is how people in your rooms see you.</p>
        </div>
      </CardContent>
    </Card>
  )
}
