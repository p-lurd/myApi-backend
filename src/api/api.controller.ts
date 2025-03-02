import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiMonitorService } from "./api-monitor.service";
import { CreateApiDto } from "./dto/create-api.dto";


@Controller('api')
export class ApisController {
  constructor(private readonly apiMonitorService: ApiMonitorService) {}

  @Post('create')
  create(@Body() createApiDto:CreateApiDto) {
    return this.apiMonitorService.createApi(createApiDto)
  }

  @Get(':id')
  findAll(@Param('id') id: string){
    return this.apiMonitorService.findApiResponses(id)
  }
}