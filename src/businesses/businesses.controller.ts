import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto, CreateUserBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { BusinessRolesGuard } from 'src/auth/guards/business-roles.guard';
import { RequireBusinessRoles, RequireSuperAdmin } from 'src/auth/guards/business-roles.decorator';
import { ROLES } from 'src/utilities/userRoles.enum';

@Controller('businesses')
@UseGuards(AuthGuard)
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  // @RequireBusinessRoles(ROLES.superAdmin)
  @RequireSuperAdmin()
  @UseGuards(BusinessRolesGuard)
  create(@Body() createBusinessDto: CreateBusinessDto) {
    const{ name, email, githubId, ownerId} = createBusinessDto
    return this.businessesService.createBusiness(name, email, githubId, ownerId);
  }

  //  to find all the business someone has access to
  @Get(':id')
  findAll(@Param('id') id: string) {
    return this.businessesService.findAll(id);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.businessesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBusinessDto: UpdateBusinessDto) {
  //   return this.businessesService.update(+id, updateBusinessDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.businessesService.remove(+id);
  // }

  // to preapprove user admin
  @Post('worker')
  @RequireBusinessRoles(ROLES.superAdmin)
  @UseGuards(BusinessRolesGuard)
  createUserBusiness(@Body() createUserBusinessDto: CreateUserBusinessDto) {
    const{ name, businessId, userId, email, role} = createUserBusinessDto;
    return this.businessesService.createUserBusiness(name, businessId, email, role, userId);
  }
}
