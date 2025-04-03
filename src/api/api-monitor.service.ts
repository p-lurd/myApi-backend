import { HttpException, Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { ApiDocument } from './schemas/api.schema';
import { ApiResponseDocument, ApiResponseModelName } from './schemas/apiResponse.schema';
import { CreateApiDto, CreateApiResponseDto } from './dto/create-api.dto';
import Redis from 'ioredis';

@Injectable()
export class ApiMonitorService  {
  private readonly logger = new Logger(ApiMonitorService.name);
  private redisClient: Redis;

  constructor(
    @InjectModel('Api') private readonly apiModel: Model<ApiDocument>,
    @InjectModel(ApiResponseModelName) private readonly apiResponseModel: Model<ApiResponseDocument>,
  ) {}

//   route to create apis
async createApi (createApiDto: CreateApiDto){
    try {
        const api: CreateApiDto = {
            url: createApiDto.url,
            businessId: createApiDto.businessId,
        }
        if(createApiDto.options){ api.options=createApiDto.options}
       
        return await this.apiModel.create(api)
    } catch (error) {
        if(error instanceof HttpException){
            // return res.status(500).json({message: error.message})
            throw error
        }
        throw new InternalServerErrorException(error.message);
    }
}

async createApiResponse(createApiResponseDto: CreateApiResponseDto){
    try {
        return await this.apiResponseModel.create(createApiResponseDto)
    } catch (error) {
        if(error instanceof HttpException){
            // return res.status(500).json({message: error.message})
            throw error
        }
        throw new InternalServerErrorException(error.message);
    }
}

async findApiResponses(id: string){
    try {
        return await this.apiResponseModel.find({businessId: id})
    } catch (error) {
        if(error instanceof HttpException){
            // return res.status(500).json({message: error.message})
            throw error
        }
        throw new InternalServerErrorException(error.message);
    }
}
}
