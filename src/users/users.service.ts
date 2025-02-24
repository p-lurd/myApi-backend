import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto, UserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, UserModelName } from './schemas/user.schema';
import { userAlreadyExists, userNotCreated } from 'src/utilities/exceptions/httpExceptions';

@Injectable()
export class UsersService {
  constructor(@InjectModel(UserModelName) private userModel: Model<UserDocument>) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const {name, email, password, avartar, githubId} = createUserDto;
      const user = await this.userModel.findOne({ email: email})
      if(user) {
        return user;
        // throw new userAlreadyExists('100CU')
      }
      const newUser = await this.userModel.create({name, email, password, avartar, githubId})
      return newUser;
    } catch (error) {
      console.log({error})
      throw new userNotCreated('100CU')
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

  async getUserById(userId){
    const user: UserDto = await this.userModel.findOne({_id: userId})
    return user
  }
}
