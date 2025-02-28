import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';

export const RedisConfig = RedisModule.forRootAsync({
  imports: [ConfigModule],
//   isGlobal: true, // Ensures Redis is available throughout the app
  useFactory: async (configService: ConfigService): Promise<RedisModuleOptions> => ({
    closeClient: true,
    config: {
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
    },
  }),
  inject: [ConfigService],
});

