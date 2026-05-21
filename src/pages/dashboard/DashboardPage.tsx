import { useQuery } from '@tanstack/react-query'
import { Users, UserCheck, FileText, TrendingUp, TrendingDown, Activity, UserPlus, BookOpen, RefreshCw, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts'
import { analyticsService } from '@/services/analytics.service'
import { formatRelativeTime } from '@/lib/utils'
import type { ActivityItem } from '@/types'

const activityIcons: Record<ActivityItem['type'], React.ElementType> = {
  member_joined: UserPlus,
  content_published: BookOpen,
  user_created: Users,
  member_suspended: ShieldAlert,
  code_generated: RefreshCw,
}

const PIE_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)']

export function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: analyticsService.getSummary,
  })

  const { data: membersChart } = useQuery({
    queryKey: ['members-chart'],
    queryFn: () => analyticsService.getMembersChart(30),
  })

  const { data: contentChart } = useQuery({
    queryKey: ['content-chart'],
    queryFn: () => analyticsService.getContentChart(30),
  })

  const { data: activity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: analyticsService.getRecentActivity,
  })

  const { data: memberDist } = useQuery({
    queryKey: ['member-distribution'],
    queryFn: analyticsService.getMemberStatusDistribution,
  })

  const stats = [
    {
      title: 'Total Membres',
      value: summary?.totalMembers ?? 0,
      growth: summary?.membersGrowth ?? 0,
      icon: UserCheck,
      description: `${summary?.activeMembers ?? 0} actifs`,
    },
    {
      title: 'Utilisateurs Admin',
      value: summary?.totalUsers ?? 0,
      growth: summary?.usersGrowth ?? 0,
      icon: Users,
      description: 'Équipe interne',
    },
    {
      title: 'Contenus',
      value: summary?.totalContent ?? 0,
      growth: summary?.contentGrowth ?? 0,
      icon: FileText,
      description: 'Articles, vidéos, audio',
    },
    {
      title: 'Taux d\'activité',
      value: summary ? `${Math.round((summary.activeMembers / summary.totalMembers) * 100)}%` : '0%',
      growth: 2.1,
      icon: Activity,
      description: 'Membres actifs',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vue d'ensemble</h1>
        <p className="text-muted-foreground">Bienvenue sur votre tableau de bord Perle de Lys.</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className="rounded-md bg-muted p-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.growth >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className={`text-xs font-medium ${stat.growth >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                      +{stat.growth}%
                    </span>
                    <span className="text-xs text-muted-foreground">{stat.description}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Members trend */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Croissance des membres</CardTitle>
            <CardDescription>Nouveaux membres sur les 30 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            {membersChart ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={membersChart}>
                  <defs>
                    <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--foreground)', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2} fill="url(#memberGradient)" name="Membres" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[220px]" />
            )}
          </CardContent>
        </Card>

        {/* Member distribution */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Répartition des membres</CardTitle>
            <CardDescription>Par statut</CardDescription>
          </CardHeader>
          <CardContent>
            {memberDist ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={memberDist} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {memberDist.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[220px]" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Content trend */}
        <Card>
          <CardHeader>
            <CardTitle>Publications de contenu</CardTitle>
            <CardDescription>Sur les 30 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            {contentChart ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={contentChart}>
                  <defs>
                    <linearGradient id="contentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
                  <Tooltip contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="value" stroke="var(--chart-2)" strokeWidth={2} fill="url(#contentGradient)" name="Publications" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-[160px]" />
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity ? activity.slice(0, 5).map((item) => {
              const Icon = activityIcons[item.type]
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-muted p-1.5 shrink-0">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{item.description}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-muted-foreground">{item.actorName}</span>
                      {item.targetName && (
                        <>
                          <span className="text-xs text-muted-foreground">·</span>
                          <Badge variant="secondary" className="text-xs py-0 h-4">{item.targetName}</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(item.createdAt)}</span>
                </div>
              )
            }) : (
              Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
