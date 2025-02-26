import { Module } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { BusinessesController } from './businesses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessSchema } from './schemas/business.schema';
import { BusinessUserSchema } from './schemas/user-business.schema';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Business', schema: BusinessSchema },
      {name: 'BusinessUser', schema: BusinessUserSchema}
    ]),
    UsersModule,
  ],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
