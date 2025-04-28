import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiMonitorService } from "./api-monitor.service";
import { CreateApiDto } from "./dto/create-api.dto";
import { FetchApiStatusDto } from "./dto/fetch-api-dashboard.dto";


@Controller('api')
export class ApisController {
  constructor(private readonly apiMonitorService: ApiMonitorService) {}

  @Post('create')
  create(@Body() createApiDto:CreateApiDto) {
    return this.apiMonitorService.createApi(createApiDto)
  }

  @Get('all/:id')
  findAll(@Param('id') id: string){
    return this.apiMonitorService.findApiResponses(id)
  }

  @Get('dashboard/:businessId')
  @UsePipes(new ValidationPipe({ transform: true }))
  findDashboard(@Param('businessId') businessId: string, @Query()query:FetchApiStatusDto) {
    return this.apiMonitorService.fetchApiStatus({businessId,...query}) 
  }
}