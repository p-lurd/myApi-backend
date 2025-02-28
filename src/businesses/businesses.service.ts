import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { InjectModel } from '@nestjs/mongoose';
import { BusinessDocument, BusinessModelName } from './schemas/business.schema';
import mongoose, { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { BusinessUserDocument, BusinessUserModelName } from './schemas/user-business.schema';
import { ROLES } from 'src/utilities/userRoles.enum';
import { userBusinessNotCreated, userBusinessNotUpdated } from 'src/utilities/exceptions/httpExceptions';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectModel(BusinessModelName)
    private businessModel: Model<BusinessDocument>,
    private readonly usersService: UsersService,
    @InjectModel(BusinessUserModelName)
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

      const userBusiness = await this.businessUserModel.create({businessId: business._id, userId: owner._id, userEmail:email, role: ROLES.superAdmin});
      if(!business || !userBusiness) {throw new InternalServerErrorException("message: error creating business")}
        const param = {userId: owner._id}
      // const user = await this.updateUserBusiness(owner._id, param);
      return business
    } catch (error) {
      console.log(error)
      return error.message;
    }
  }

  //  to find all the business an admin has access to
  async findAll(id: string) {
  try {
    if(!id){throw new BadRequestException("the param: id is absent")}
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
    return  [...businesses] ;
  } catch (error) {
    return error.message;
  }
    
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

  async createUserBusiness(name: string, businessId: string, email: string, role: ROLES, userId?: string){
    try {
      const userBusinessData: any = { name, businessId, userEmail:email, role };
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        userBusinessData.userId = new mongoose.Types.ObjectId(userId);
      }
      const userBusiness = await this.businessUserModel.create(userBusinessData);
    if(!userBusiness){throw new userBusinessNotCreated('100CUB')}
    return userBusiness
    } catch (error) {
      console.log(error)
      return error.message;
    }
    
  }


  async updateUserBusiness(email: string, param){
    const userBusiness = await this.businessUserModel.updateOne({
      userEmail: email,
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
