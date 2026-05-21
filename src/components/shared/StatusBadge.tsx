import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MemberStatus, UserStatus, ContentStatus } from '@/types'

type Status = MemberStatus | UserStatus | ContentStatus

const statusConfig: Record<Status, { label: string; className: string }> = {
  active: { label: 'Actif', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  suspended: { label: 'Suspendu', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  inactive: { label: 'Inactif', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  pending: { label: 'En attente', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  expired: { label: 'Expiré', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  published: { label: 'Publié', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  scheduled: { label: 'Programmé', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  archived: { label: 'Archivé', className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: '' }
  return (
    <Badge
      variant="outline"
      className={cn('border-0 font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
