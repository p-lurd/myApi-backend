import { HttpException, Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ApiDocument } from './schemas/api.schema';
import { ApiResponseDocument, ApiResponseModelName } from './schemas/apiResponse.schema';
import { CreateApiDto, CreateApiResponseDto } from './dto/create-api.dto';

@Injectable()
export class ApiMonitorService  {
  private readonly logger = new Logger(ApiMonitorService.name);

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
            apiName: createApiDto.apiName,
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


// the query help group the data
async findApiResponses(id: string) {
    try {
      // const structures=  await this.apiResponseModel.aggregate([
      //   { $match: { businessId: new mongoose.Types.ObjectId(id) } },
      //   { $sort: { createdAt: -1 } }, // Sort by createdAt field in descending order
      //   { $group: {
      //       _id: "$apiId",
      //       responses: { 
      //         $push: "$$ROOT" 
      //       }
      //     }
      //   },
      //   { $project: {
      //       _id: 1,
      //       responses: { $slice: ["$responses", 0, 30] } // Take only the first 30 responses
      //     }
      //   }
      // ]);
      // console.log(structures)
      const data = await this.apiResponseModel.aggregate([
        // Stage 1: Match by business ID
        { $match: { businessId: new mongoose.Types.ObjectId(id) } },
        
        // Stage 2: Create a date field for grouping
        { $addFields: {
            dateString: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          }
        },
        
        // Stage 3: Sort by timestamp (newest first) to ensure we get the latest first
        { $sort: { createdAt: -1 } },
        
        // Stage 4: Group by API ID, date, and success to separate error and non-error responses
        { $group: {
            _id: {
              apiId: "$apiId",
              date: "$dateString",
              success: "$success"
            },
            firstResponse: { $first: "$$ROOT" }  // Take the most recent response for each group
          }
        },
        
        // Stage 5: Group again by API ID and date to select the appropriate response per day
        { $group: {
            _id: {
              apiId: "$_id.apiId",
              date: "$_id.date"
            },
            // Save responses sorted by success (false first)
            dayResponses: { $push: "$firstResponse" }
          }
        },
        
        // Stage 6: Process responses to select one per day based on priority
        { $project: {
            _id: 0,
            apiId: "$_id.apiId",
            date: "$_id.date",
            // Choose the appropriate response:
            // If it's today, take the most recent (first after sorting)
            // For other days, prioritize error responses (success=false)
            selectedResponse: {
              $cond: [
                { $eq: ["$_id.date", { $dateToString: { format: "%Y-%m-%d", date: new Date() } }] },
                { $arrayElemAt: [{ $sortArray: { input: "$dayResponses", sortBy: { createdAt: -1 } } }, 0] },
                { $arrayElemAt: [{ $sortArray: { input: "$dayResponses", sortBy: { success: 1, createdAt: -1 } } }, 0] }
              ]
            }
          }
        },
        
        // Stage 7: Sort by date ascending to get most recent days first
        { $sort: { date: 1 } },
        
        // Stage 8: Group by API ID to get the final structure
        { $group: {
            _id: "$apiId",
            responses: { $push: "$selectedResponse" }
          }
        },
        
        // Stage 9: Limit to 30 responses per API ID
        { $project: {
            _id: 1,
            responses: { $slice: ["$responses", 0, 30] }
          }
        }
      ]);
      return data;
    } catch (error) {
      if(error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
