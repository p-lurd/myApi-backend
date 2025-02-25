import { Injectable } from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { InjectModel } from '@nestjs/mongoose';
import { BusinessDocument, BusinessModelName } from './schemas/business.schema';
import { Model } from 'mongoose';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectModel(BusinessModelName) private businessModel: Model<BusinessDocument>,
    ) {}
  async createBusiness(name: string, email: string, githubId: string, ownerId: string){
    // const owner = await this.usersService.getUserById(ownerId);
    // if (!owner) throw new NotFoundException('Owner not found');

    return await this.businessModel.create({ name, email, githubId, owner: ownerId });
  }

  findAll() {
    return `This action returns all businesses`;
  }

  findOne(id: number) {
    return `This action returns a #${id} business`;
  }

  update(id: number, updateBusinessDto: UpdateBusinessDto) {
    return `This action updates a #${id} business`;
  }

  remove(id: number) {
    return `This action removes a #${id} business`;
  }
}
