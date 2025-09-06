import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiMonitorService } from "./api-monitor.service";
import { CreateApiDto } from "./dto/create-api.dto";
import { FetchApiStatusDto } from "./dto/fetch-api-dashboard.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RequireBusinessRoles } from "src/auth/guards/business-roles.decorator";
import { ROLES } from "src/utilities/userRoles.enum";
import { BusinessRolesGuard } from "src/auth/guards/business-roles.guard";


@Controller('api')
export class ApisController {
  constructor(private readonly apiMonitorService: ApiMonitorService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  @RequireBusinessRoles(ROLES.superAdmin)
  @UseGuards(BusinessRolesGuard)
  create(@Body() createApiDto:CreateApiDto) {
    return this.apiMonitorService.createApi(createApiDto)
  }

  @Get('all/:id')
  findAll(@Param('id') id: string){
    return this.apiMonitorService.findApiResponses(id)
  }

  @Get('dashboard/:businessId')
  @UseGuards(AuthGuard)
  @RequireBusinessRoles(ROLES.admin, ROLES.superAdmin)
  @UseGuards(BusinessRolesGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  findDashboard(@Param('businessId') businessId: string, @Query()query:FetchApiStatusDto) {
    return this.apiMonitorService.fetchApiStatus({businessId,...query}) 
  }

  @Get('monitoring/apis/:businessId')
  @UseGuards(AuthGuard)
  @RequireBusinessRoles(ROLES.admin, ROLES.superAdmin)
  @UseGuards(BusinessRolesGuard)
  findAllApis(@Param('businessId') businessId: string){
    return this.apiMonitorService.listBusinessApis(businessId)
  }
}