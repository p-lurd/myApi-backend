import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { InjectModel } from '@nestjs/mongoose';
import { BusinessDocument, BusinessModelName } from './schemas/business.schema';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { BusinessUserDocument } from './schemas/user-business.schema';
import { ROLES } from 'src/utilities/userRoles.enum';
import { userBusinessNotCreated, userBusinessNotUpdated } from 'src/utilities/exceptions/httpExceptions';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectModel(BusinessModelName)
    private businessModel: Model<BusinessDocument>,
    private readonly usersService: UsersService,
    private businessUserModel: Model<BusinessUserDocument>
  ) {}
  async createBusiness(
    name: string,
    email: string,
    githubId: string,
    ownerId: string,
  ) {
    try {
      const owner = await this.usersService.getUserDetails({ _id: ownerId });
      if (!owner) throw new NotFoundException('Owner not found');
      const business = await this.businessModel.create({
        name,
        email,
        githubId,
        creatorId: ownerId,
      });

      const userBusiness = await this.businessUserModel.create({name, businessId: business._id, userId: owner._id, email, role: ROLES.superAdmin});
      if(!business || !userBusiness) {throw new InternalServerErrorException("message: error creating business")}
        const param = {userId: owner._id}
      const user = await this.updateUserBusiness(owner._id, param);
      return business
    } catch (error) {
      console.log(error)
    }
  }

  //  to find all the business an admin has access to
  async findAll(id: number) {
    const businesses = new Set();
    const userBusinesses = await this.businessUserModel.find({ userId: id });
    const businessPromises = userBusinesses.map(async (UB) => {
        const business = await this.businessModel.findOne({ _id: UB.businessId });
        if (business) return business;
    });
    const businessesArray = await Promise.all(businessPromises);
    businessesArray.forEach(business => {
        if (business) businesses.add(business);
    });
    return { businesses: [...businesses] };
}


  // findOne(id: number) {
  //   return `This action returns a #${id} business`;
  // }

  // update(id: number, updateBusinessDto: UpdateBusinessDto) {
  //   return `This action updates a #${id} business`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} business`;
  // }

  async createUserBusiness(name: string, businessId: string, userId: string, email: string, role: ROLES){
    const userBusiness = await this.businessUserModel.create({name, businessId, userId, email, role});
    if(!userBusiness){throw new userBusinessNotCreated('100CUB')}
    return userBusiness
  }
  async updateUserBusiness(id, param){
    const userBusiness = await this.businessUserModel.updateOne({
      _id: id,
      param,
      function (err, docs){
        if (err){
          console.error(err.message)
            throw new userBusinessNotUpdated('100UUB')
        }
        else{
            return {userBusiness: docs}
        }
      }
    });
    return userBusiness
  
  }
}
