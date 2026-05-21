import type { AnalyticsSummary, ChartDataPoint, ActivityItem } from '@/types'
import { delay, randomBetween } from '@/lib/utils'
import { MOCK_MEMBERS, MOCK_CONTENT, MOCK_ADMIN_USERS, MOCK_ACTIVITIES } from './seed'

function generateChartData(days: number, base: number, variance: number): ChartDataPoint[] {
  const data: ChartDataPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      value: base + randomBetween(-variance, variance),
    })
  }
  return data
}

export const analyticsMock = {
  async getSummary(): Promise<AnalyticsSummary> {
    await delay(400)
    return {
      totalMembers: MOCK_MEMBERS.length,
      totalUsers: MOCK_ADMIN_USERS.length,
      totalContent: MOCK_CONTENT.length,
      activeMembers: MOCK_MEMBERS.filter(m => m.status === 'active').length,
      membersGrowth: 12.5,
      usersGrowth: 3.2,
      contentGrowth: 8.7,
    }
  },

  async getMembersChart(days = 30): Promise<ChartDataPoint[]> {
    await delay(300)
    return generateChartData(days, 60, 15)
  },

  async getContentChart(days = 30): Promise<ChartDataPoint[]> {
    await delay(300)
    return generateChartData(days, 8, 4)
  },

  async getRecentActivity(): Promise<ActivityItem[]> {
    await delay(300)
    return MOCK_ACTIVITIES
  },

  async getMemberStatusDistribution(): Promise<{ name: string; value: number; color: string }[]> {
    await delay(300)
    const counts = MOCK_MEMBERS.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)
    return [
      { name: 'Actives', value: counts.active ?? 0, color: 'var(--chart-1)' },
      { name: 'En attente', value: counts.pending ?? 0, color: 'var(--chart-2)' },
      { name: 'Suspendues', value: counts.suspended ?? 0, color: 'var(--chart-3)' },
      { name: 'Expirées', value: counts.expired ?? 0, color: 'var(--chart-4)' },
    ]
  },

  async getContentTypeDistribution(): Promise<{ name: string; value: number }[]> {
    await delay(300)
    const counts = MOCK_CONTENT.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(counts).map(([type, value]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value,
    }))
  },
}
