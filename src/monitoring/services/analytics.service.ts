import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApiResponseDocument, ApiResponseModelName } from 'src/api/schemas/apiResponse.schema';
import { RedisService } from '../../redis/redis.service';
import { GetMetricsDto } from '../dto/metrics-request.dto';
import { MetricsResponseDto } from '../dto/metrics-response.dto';

interface AggregationResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalResponseTime: number;
  successfulResponseCount: number;
  minResponseTime?: number;
  maxResponseTime?: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(ApiResponseModelName)
    private readonly apiResponseModel: Model<ApiResponseDocument>,
    private redisService: RedisService,
  ) {}

  async getMetrics(dto: GetMetricsDto): Promise<MetricsResponseDto> {
    const queryStart = Date.now();
    const { apiId, startDate, endDate } = dto;

    // const allMetrics = await this.apiResponseModel.find({apiId})
    // console.log({allMetrics});
    // Validate date range
    this.validateDateRange(startDate, endDate);

    // Generate cache key
    const cacheKey = this.generateCacheKey(apiId, startDate, endDate);

    console.log('computing', apiId, startDate, endDate, queryStart)
    // Check cache first
    const cachedResult = await this.getCachedMetrics(cacheKey);
    if (cachedResult) {
      this.logger.log(`Cache hit for key: ${cacheKey}`);
      return {
        ...cachedResult,
        fromCache: true,
        queryDuration: Date.now() - queryStart,
      };
    }

    this.logger.log(`Cache miss for key: ${cacheKey}, querying database`);

    // Compute metrics
    const metrics = await this.computeMetrics(apiId, startDate, endDate, queryStart);

    console.log({metrics})
    // Cache the result
    const ttl = this.determineCacheTTL(startDate, endDate);
    await this.cacheMetrics(cacheKey, metrics, ttl);

    return {
      ...metrics,
      fromCache: false,
    };
  }

  private async computeMetrics(
    apiId: string,
    startDate: string,
    endDate: string,
    queryStart: number,
  ): Promise<MetricsResponseDto> {
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T23:59:59.999Z');
    try {
      // Single aggregation pipeline for efficiency
      const pipeline = [
  {
    $match: {
      // Convert apiId string to ObjectId
      apiId: new Types.ObjectId(apiId),
      createdAt: { $gte: start, $lte: end },
    },
  },
  {
    $group: {
      _id: null,
      totalRequests: { $sum: 1 },
      successfulRequests: {
        $sum: {
          $cond: [
            {
              $and: [
                { $eq: ['$success', true] },
                { $gte: ['$statuscode', 200] },
                { $lt: ['$statuscode', 300] },
              ],
            },
            1,
            0,
          ],
        },
      },
      failedRequests: {
        $sum: {
          $cond: [
            {
              $or: [
                { $eq: ['$success', false] },
                { $lt: ['$statuscode', 200] },
                { $gte: ['$statuscode', 300] },
              ],
            },
            1,
            0,
          ],
        },
      },
      totalResponseTime: {
        $sum: {
          $cond: [
            {
              $and: [
                { $eq: ['$success', true] },
                { $gte: ['$statuscode', 200] },
                { $lt: ['$statuscode', 300] },
              ],
            },
            '$responsetime',
            0,
          ],
        },
      },
      successfulResponseCount: {
        $sum: {
          $cond: [
            {
              $and: [
                { $eq: ['$success', true] },
                { $gte: ['$statuscode', 200] },
                { $lt: ['$statuscode', 300] },
              ],
            },
            1,
            0,
          ],
        },
      },
      minResponseTime: {
        $min: {
          $cond: [
            {
              $and: [
                { $eq: ['$success', true] },
                { $gte: ['$statuscode', 200] },
                { $lt: ['$statuscode', 300] },
                { $gt: ['$responsetime', 0] },
              ],
            },
            '$responsetime',
            null,
          ],
        },
      },
      maxResponseTime: {
        $max: {
          $cond: [
            {
              $and: [
                { $eq: ['$success', true] },
                { $gte: ['$statuscode', 200] },
                { $lt: ['$statuscode', 300] },
              ],
            },
            '$responsetime',
            null,
          ],
        },
      },
    },
  },
];

const [result] = await this.apiResponseModel.aggregate<AggregationResult>(pipeline);
      console.log({result})
      if (!result || result.totalRequests === 0) {
        return this.getEmptyMetrics(Date.now() - queryStart);
      }

      // Calculate metrics
      const uptimePercentage = (result.successfulRequests / result.totalRequests) * 100;
      const averageResponseTime = result.successfulResponseCount > 0 
        ? result.totalResponseTime / result.successfulResponseCount 
        : 0;

      // Calculate estimated downtime (rough estimation)
      const totalDowntime = this.calculateDowntime(result.failedRequests, startDate, endDate);

      return {
        uptimePercentage: parseFloat(uptimePercentage.toFixed(2)),
        averageResponseTime: parseFloat(averageResponseTime.toFixed(2)),
        totalRequests: result.totalRequests,
        failedRequests: result.failedRequests,
        totalDowntime,
        minResponseTime: result.minResponseTime || 0,
        maxResponseTime: result.maxResponseTime || 0,
        lastUpdated: new Date().toISOString(),
        queryDuration: Date.now() - queryStart,
        fromCache: false,
      };
    } catch (error) {
      this.logger.error('Error computing metrics:', error);
      throw error;
    }
  }

  private calculateDowntime(failedRequests: number, startDate: string, endDate: string): number {
    // Simple estimation: assume each failed request represents 1 minute of downtime
    // You can make this more sophisticated based on your monitoring frequency
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    const estimatedDowntime = Math.min(failedRequests, totalMinutes * 0.1); // Max 10% downtime
    return Math.floor(estimatedDowntime);
  }

  private getEmptyMetrics(queryDuration: number): MetricsResponseDto {
    return {
      uptimePercentage: 0,
      averageResponseTime: 0,
      totalRequests: 0,
      failedRequests: 0,
      totalDowntime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      lastUpdated: new Date().toISOString(),
      queryDuration,
      fromCache: false,
    };
  }

  private generateCacheKey(apiId: string, startDate: string, endDate: string): string {
    return `metrics:${apiId}:${startDate}:${endDate}`;
  }

  private async getCachedMetrics(cacheKey: string): Promise<MetricsResponseDto | null> {
    try {
      const cached = await this.redisService.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.logger.error('Error getting cached metrics:', error);
      return null;
    }
  }

  private async cacheMetrics(
    cacheKey: string,
    metrics: MetricsResponseDto,
    ttlSeconds: number,
  ): Promise<void> {
    try {
      // Don't cache fromCache and queryDuration fields
      const { fromCache, queryDuration, ...metricsToCache } = metrics;
      await this.redisService.set(cacheKey, JSON.stringify(metricsToCache), ttlSeconds);
      this.logger.log(`Cached metrics with TTL ${ttlSeconds}s for key: ${cacheKey}`);
    } catch (error) {
      this.logger.error('Error caching metrics:', error);
    }
  }

  private determineCacheTTL(startDate: string, endDate: string): number {
    const now = new Date();
    const end = new Date(endDate + 'T23:59:59.999Z');
    const hoursDiff = (now.getTime() - end.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 1) return 60;       // 1 minute for very recent data
    if (hoursDiff < 24) return 300;     // 5 minutes for today's data  
    if (hoursDiff < 168) return 1800;   // 30 minutes for this week's data
    return 3600;                        // 1 hour for older data
  }

  private validateDateRange(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }

    if (start > end) {
      throw new Error('Start date must be before or equal to end date');
    }

    if (end > now) {
      throw new Error('End date cannot be in the future');
    }

    // Limit to max 1 year range to prevent performance issues
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    if (start < yearAgo) {
      throw new Error('Date range cannot exceed 1 year');
    }
  }

  // Method to invalidate cache for specific API
  async invalidateApiCache(apiId: string): Promise<void> {
    try {
      const pattern = `metrics:${apiId}:*`;
      const keys = await this.redisService.keys(pattern);
      
      for (const key of keys) {
        await this.redisService.del(key);
      }
      
      this.logger.log(`Invalidated ${keys.length} cache entries for API ${apiId}`);
    } catch (error) {
      this.logger.error('Error invalidating cache:', error);
    }
  }

  // Additional utility methods for debugging
  async debugApiData(apiId: string): Promise<any> {
    try {
      const objectIdApiId = new Types.ObjectId(apiId);
      
      // Count total documents
      const totalCount = await this.apiResponseModel.countDocuments({ apiId: objectIdApiId });
      
      // Get sample documents
      const sampleDocs = await this.apiResponseModel
        .find({ apiId: objectIdApiId })
        .limit(5)
        .sort({ createdAt: -1 })
        .lean();
      
      // Get date range
      const dateRange = await this.apiResponseModel.aggregate([
        { $match: { apiId: objectIdApiId } },
        {
          $group: {
            _id: null,
            minDate: { $min: '$createdAt' },
            maxDate: { $max: '$createdAt' },
          },
        },
      ]);
      
      return {
        totalCount,
        sampleDocs,
        dateRange: dateRange[0] || null,
        apiId: objectIdApiId.toString(),
      };
    } catch (error) {
      this.logger.error('Error in debugApiData:', error);
      throw error;
    }
  }
}