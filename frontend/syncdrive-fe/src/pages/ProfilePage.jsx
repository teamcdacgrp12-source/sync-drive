import { useEffect, useState } from 'react'
import Loader from '@/components/Loader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { userApi } from '@/api/user.api'
import { authUtils } from '@/features/auth/auth.utils'
import AvatarUpload from '@/features/user/AvatarUpload'
import EditProfileForm from '@/features/user/EditProfileForm'
import ProfileCard from '@/features/user/ProfileCard'

const mergeProfile = (currentUser, response) => ({
  ...currentUser,
  ...response,
  id: response.userId ?? currentUser?.id,
})

export default function ProfilePage() {
  const [profile, setProfile] = useState(authUtils.getUser)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const applyProfile = (response) => {
    setProfile((currentUser) => {
      const nextProfile = mergeProfile(currentUser, response)
      authUtils.updateUser(nextProfile)
      return nextProfile
    })
  }

  useEffect(() => {
    const currentUser = authUtils.getUser()

    if (!currentUser?.id) {
      setError('Your account details are unavailable. Please sign in again.')
      setLoading(false)
      return
    }

    userApi.getProfile(currentUser.id)
      .then(applyProfile)
      .catch(() => setError('Unable to load your profile. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const saveProfile = async (changes) => {
    setSaving(true)
    setError(null)

    try {
      const response = await userApi.updateProfile(changes)
      applyProfile(response)
    } catch {
      setError('Unable to save your changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const uploadAvatar = async (file) => {
    setUploading(true)
    setError(null)

    try {
      const response = await userApi.uploadAvatar(file)
      applyProfile(response)
    } catch {
      setError('Unable to upload your avatar. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <Loader label="Loading your profile" />

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
        <p className="mt-2 text-slate-600">Personalize how you appear in SyncDrive rooms.</p>
      </div>
      {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
      <ProfileCard profile={profile} />
      <Card>
        <CardHeader><CardTitle>Profile photo</CardTitle></CardHeader>
        <CardContent><AvatarUpload profile={profile} onUpload={uploadAvatar} uploading={uploading} /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Profile details</CardTitle></CardHeader>
        <CardContent><EditProfileForm profile={profile} onSave={saveProfile} saving={saving} /></CardContent>
      </Card>
    </div>
  )
}
