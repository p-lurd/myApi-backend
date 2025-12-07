import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonitoringLog, MonitoringLogSchema } from './schemas/monitoring-log.schema';
import { MonitoringController } from './controllers/monitoring.controller';
import { AnalyticsService } from './services/analytics.service';
import { RedisService } from '../redis/redis.service';
import { ApiMonitorModule } from 'src/api/api.module';
import { ApiResponseModelName, ApiResponseSchema } from 'src/api/schemas/apiResponse.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MonitoringLog.name, schema: MonitoringLogSchema }
    ]),
    MongooseModule.forFeature([
      { name: ApiResponseModelName, schema: ApiResponseSchema }
    ]),
  ],
  controllers: [MonitoringController],
  providers: [AnalyticsService, RedisService],
  exports: [AnalyticsService],
})
export class MonitoringModule {}