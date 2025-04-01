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

  // async fetchAndQueueApis() {
  //   this.logger.log('Fetching APIs...');
  //   const apis = await this.apiModel.find();

  //   for (const api of apis) {
  //     await this.redisClient.lpush('api_jobs', JSON.stringify(api));
  //   }

  //   this.logger.log(`Queued ${apis.length} APIs for processing.`);
  // }

  // async onModuleInit() {

  //   // CHANGES HERE
  //   this.redisClient = this.redisService.getOrThrow();
  //   this.listenForResults();
  // }

  // async listenForResults() {
  //   this.redisClient.subscribe('api_results', (err, count) => {
  //     if (err) {
  //       this.logger.error('Failed to subscribe to api_results:', err);
  //     } else {
  //       this.logger.log(`Subscribed to ${count} channels.`);
  //     }
  //   });

  //   this.redisClient.on('message', async (channel, message) => {
  //       try {
  //           if (channel === 'api_results') {
  //               const result = JSON.parse(message);
  //               console.log({result})
  //               // await this.apiModel.findByIdAndUpdate(result.id, { status: result.status });
  //               await this.apiResponseModel.create(result)
  //               this.logger.log(`Stored API result: ${result.id} - ${result.status}`);
  //             }
  //       } catch (error) {
  //           if(error instanceof HttpException){
  //               // return res.status(500).json({message: error.message})
  //               return error
  //           }
  //           throw new InternalServerErrorException(error.message);
  //       }
      
  //   });
  // }

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
