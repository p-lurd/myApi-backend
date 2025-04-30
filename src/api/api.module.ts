import { forwardRef, Module } from '@nestjs/common';
import { ApiMonitorService } from './api-monitor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiModelName, ApiSchema } from './schemas/api.schema';
import { ApisController } from './api.controller';
import { ApiResponseModelName, ApiResponseSchema } from './schemas/apiResponse.schema';
import { AuthModule } from 'src/auth/auth.module';
import { BusinessesModule } from 'src/businesses/businesses.module';

@Module({
  imports: [
    AuthModule,
    BusinessesModule,
    MongooseModule.forFeature([
    { name: ApiModelName, schema: ApiSchema },
    {name: ApiResponseModelName, schema: ApiResponseSchema}
  ])],
  providers: [ApiMonitorService],
  exports: [ApiMonitorService],
  controllers: [ApisController]
})
export class ApiMonitorModule {}
