import { Module } from '@nestjs/common';
import { ApiMonitorService } from './api-monitor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiModelName, ApiSchema } from './schemas/api.schema';
import { ApisController } from './api.controller';
import { ApiResponseModelName, ApiResponseSchema } from './schemas/apiResponse.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
    { name: ApiModelName, schema: ApiSchema },
    {name: ApiResponseModelName, schema: ApiResponseSchema}
  ])],
  providers: [ApiMonitorService],
  exports: [ApiMonitorService],
  controllers: [ApisController]
})
export class ApiMonitorModule {}
