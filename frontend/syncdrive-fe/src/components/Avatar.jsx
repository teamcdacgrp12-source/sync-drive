import { Avatar as AvatarRoot, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const initialsFrom = (name) =>
  (name ?? 'SyncDrive')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

export default function Avatar({ user, size = 'md', className = '' }) {
  const sizeClass = size === 'lg' ? 'size-24 text-2xl' : size === 'sm' ? 'size-8 text-xs' : 'size-10'
  const name = user?.displayName || user?.username

  return (
    <AvatarRoot className={`${sizeClass} ${className}`}>
      {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={`${name ?? 'User'} avatar`} />}
      <AvatarFallback>{initialsFrom(name)}</AvatarFallback>
    </AvatarRoot>
  )
}
