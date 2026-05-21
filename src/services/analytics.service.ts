import { analyticsMock } from '@/mocks/analytics.mock'
import type { AnalyticsSummary, ChartDataPoint, ActivityItem } from '@/types'

export const analyticsService = {
  getSummary: (): Promise<AnalyticsSummary> =>
    analyticsMock.getSummary(),

  getMembersChart: (days?: number): Promise<ChartDataPoint[]> =>
    analyticsMock.getMembersChart(days),

  getContentChart: (days?: number): Promise<ChartDataPoint[]> =>
    analyticsMock.getContentChart(days),

  getRecentActivity: (): Promise<ActivityItem[]> =>
    analyticsMock.getRecentActivity(),

  getMemberStatusDistribution: (): Promise<{ name: string; value: number; color: string }[]> =>
    analyticsMock.getMemberStatusDistribution(),

  getContentTypeDistribution: (): Promise<{ name: string; value: number }[]> =>
    analyticsMock.getContentTypeDistribution(),
}
