export interface MetricsResponseDto {
  uptimePercentage: number;
  averageResponseTime: number;
  totalRequests: number;
  failedRequests: number;
  totalDowntime: number;
  minResponseTime?: number;
  maxResponseTime?: number;
  lastUpdated: string;
  queryDuration: number;
  fromCache: boolean;
}