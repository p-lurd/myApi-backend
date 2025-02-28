import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { ApiDocument } from './schemas/api.schema';
import { ApiResponseDocument, ApiResponseModelName } from './schemas/apiResponse.schema';

@Injectable()
export class ApiMonitorService implements OnModuleInit {
  private readonly logger = new Logger(ApiMonitorService.name);
  private redisClient;

  constructor(
    @InjectModel('Api') private readonly apiModel: Model<ApiDocument>,
    @InjectModel(ApiResponseModelName) private readonly apiResponseModel: Model<ApiResponseDocument>,
    private readonly redisService: RedisService
  ) {}

  async fetchAndQueueApis() {
    this.logger.log('Fetching APIs...');
    const apis = await this.apiModel.find();

    for (const api of apis) {
      await this.redisClient.lpush('api_jobs', JSON.stringify(api));
    }

    this.logger.log(`Queued ${apis.length} APIs for processing.`);
  }

  async onModuleInit() {

    // CHANGES HERE
    this.redisClient = this.redisService.getOrThrow();
    this.listenForResults();
  }

  async listenForResults() {
    this.redisClient.subscribe('api_results', (err, count) => {
      if (err) {
        this.logger.error('Failed to subscribe to api_results:', err);
      } else {
        this.logger.log(`Subscribed to ${count} channels.`);
      }
    });

    this.redisClient.on('message', async (channel, message) => {
      if (channel === 'api_results') {
        const result = JSON.parse(message);
        console.log({result})
        // await this.apiModel.findByIdAndUpdate(result.id, { status: result.status });
        await this.apiResponseModel.create(result)
        this.logger.log(`Stored API result: ${result.id} - ${result.status}`);
      }
    });
  }

//   route to create apis
}
