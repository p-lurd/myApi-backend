import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Get
} from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { GetMetricsDto } from '../dto/metrics-request.dto';
import { MetricsResponseDto } from '../dto/metrics-response.dto';

@Controller('api/monitoring')
export class MonitoringController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('metrics')
  async getMetrics(@Body() dto: GetMetricsDto): Promise<MetricsResponseDto> {
    try {
      return await this.analyticsService.getMetrics(dto);
    } catch (error) {
      if (error.message.includes('Date range') || error.message.includes('Start date')) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Internal server error while fetching metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('invalidate-cache/:apiId')
  async invalidateCache(@Body('apiId') apiId: string): Promise<{ message: string }> {
    try {
      await this.analyticsService.invalidateApiCache(apiId);
      return { message: 'Cache invalidated successfully' };
    } catch (error) {
      throw new HttpException(
        'Error invalidating cache',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('insight')
  async getAIInsight(): Promise<{ message: string }> {
    try {
      console.log('got here')
      await new Promise(resolve=>setTimeout(resolve, 100))
      return {message:'Feature being worked on currently'}
    } catch (error) {
      throw new HttpException(
        'error fetching ai insight',
        HttpStatus.NO_CONTENT
      )
    }
  }
}