import { Module } from '@nestjs/common';
import { ApiMonitorService } from './api-monitor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisConfig } from 'src/redis/redis.config';
import { ApiModelName, ApiSchema } from './schemas/api.schema';
import { ApisController } from './api.controller';
import { ApiResponseModelName, ApiResponseSchema } from './schemas/apiResponse.schema';

@Module({
  imports: [
    RedisConfig,
    MongooseModule.forFeature([
    { name: ApiModelName, schema: ApiSchema },
    {name: ApiResponseModelName, schema: ApiResponseSchema}
  ])],
  providers: [ApiMonitorService],
  exports: [ApiMonitorService],
  controllers: [ApisController]
})
export class ApiMonitorModule {}
