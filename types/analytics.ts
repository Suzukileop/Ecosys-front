export interface DashboardKpisDto {
  scheduledCount: number;
  publishedCount: number;
  successRatePercent: number;
  totalViews: number;
}

export interface DailyPublicationPoint {
  date: string;
  count: number;
  views?: number;
}

export interface PlatformShareSlice {
  platform: string;
  count: number;
}

export interface AnalyticsDashboardDto {
  kpis: DashboardKpisDto;
  publicationsLast30Days: DailyPublicationPoint[];
  platformDistribution: PlatformShareSlice[];
}

export interface CreatorAnalyticsDto {
  portfolioCount: number;
  totalViews: number;
  totalLikes: number;
}
