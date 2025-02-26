import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto, CreateUserBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  create(@Body() createBusinessDto: CreateBusinessDto) {
    const{ name, email, githubId, ownerId} = createBusinessDto
    return this.businessesService.createBusiness(name, email, githubId, ownerId);
  }

  //  to find all the business an admin has access to
  @Get(':id')
  findAll(@Param('id') id: string) {
    return this.businessesService.findAll(+id);
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
  createUserBusiness(@Body() createUserBusinessDto: CreateUserBusinessDto) {
    const{ name, businessId, userId, email, role} = createUserBusinessDto
    return this.businessesService.createUserBusiness(name, businessId, userId, email, role);
  }
}
