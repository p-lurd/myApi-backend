import { Injectable } from '@nestjs/common';
import { RedisService, DEFAULT_REDIS } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class AppService {
  private readonly redis: Redis | null;
  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getOrThrow();
    // same as
    // this.redis = this.redisService.getOrThrow(DEFAULT_REDIS);

    // or
    // this.redis = this.redisService.getOrNil();
    // same as
    // this.redis = this.redisService.getOrNil(DEFAULT_REDIS);
  }

  async set() {
    return await this.redis.set('key', 'value', 'EX', 10);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
