import { Module } from '@nestjs/common';
import { ApiMonitorService } from './api-monitor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisConfig } from 'src/redis/redis.config';
import { ApiModelName, ApiSchema } from './schemas/api.schema';

@Module({
  imports: [RedisConfig, MongooseModule.forFeature([{ name: ApiModelName, schema: ApiSchema }])],
  providers: [ApiMonitorService],
  exports: [ApiMonitorService],
})
export class ApiMonitorModule {}
