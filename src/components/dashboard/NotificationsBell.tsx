import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, Star, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { reviewsService } from '@/services/reviews.service'
import { membersService } from '@/services/members.service'
import { useNotificationsStore } from '@/store/notifications.store'

// Real notifications: reviews awaiting moderation + members awaiting activation.
// Badge shows the count of NEW items since the admin last marked them seen.
export function NotificationsBell() {
  const navigate = useNavigate()
  const { seen, markSeen } = useNotificationsStore()

  const { data: pendingReviews = [] } = useQuery({
    queryKey: ['reviews', 'PENDING'],
    queryFn: () => reviewsService.list('PENDING'),
    refetchInterval: 60_000,
  })
  const { data: pendingMembers } = useQuery({
    queryKey: ['members', { status: 'pending' }],
    queryFn: () => membersService.getMembers({ status: 'pending', limit: 200 }),
    refetchInterval: 60_000,
  })

  const reviewCount = pendingReviews.length
  const memberCount = pendingMembers?.data.length ?? 0
  const total = reviewCount + memberCount
  const unread = Math.max(0, total - seen)

  return (
    <Popover onOpenChange={(open) => open && markSeen(total)}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-4 h-4" />
          </Button>
          {unread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 p-0 text-xs flex items-center justify-center">
              {unread}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium">Notifications</p>
        </div>
        <div className="divide-y">
          <button
            type="button"
            onClick={() => navigate('/dashboard/reviews')}
            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent"
          >
            <Star className="h-4 w-4 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Avis à modérer</p>
              <p className="text-xs text-muted-foreground">
                {reviewCount} en attente d'approbation
              </p>
            </div>
            {reviewCount > 0 && <Badge variant="secondary">{reviewCount}</Badge>}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/members')}
            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent"
          >
            <UserPlus className="h-4 w-4 text-emerald-600" />
            <div className="flex-1">
              <p className="text-sm font-medium">Membres en attente</p>
              <p className="text-xs text-muted-foreground">
                {memberCount} en attente d'activation
              </p>
            </div>
            {memberCount > 0 && <Badge variant="secondary">{memberCount}</Badge>}
          </button>
        </div>
        {total === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Rien à signaler pour le moment.
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}
