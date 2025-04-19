import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto, UserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserModelName } from './schemas/user.schema';
import { userAlreadyExists, userNotCreated } from 'src/utilities/exceptions/httpExceptions';
import * as bcrypt from 'bcryptjs';
import { BusinessesService } from 'src/businesses/businesses.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModelName) private userModel: Model<UserDocument>,
    // private readonly businessesService: BusinessesService
    ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const {name, email, password, avartar, githubId} = createUserDto;
      const user = await this.userModel.findOne({ email: email})
      if(user) {
        return user;
        // throw new userAlreadyExists('100CU')
      }
      if(password){
        const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = await this.userModel.create({name, email, password:hashedPassword, avartar, githubId})
      // const param = {userId: newUser._id}
      // const userBusiness = await this.businessesService.updateUserBusiness(businessId, param);
      // if(!userBusiness){throw new userNotCreated('100CU')}
      return newUser;
      }else{
        const newUser = await this.userModel.create({name, email, avartar, githubId})
      return newUser;
      }
      
    } catch (error) {
      console.log({error})
      // throw new userNotCreated('100CU')
      return error;
    }
  }

  // findAll() {
  //   return `This action returns all users`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }

  async getUserDetails(identifier){
    const user: UserDto = await this.userModel.findOne(identifier)
    return user
  }
}
