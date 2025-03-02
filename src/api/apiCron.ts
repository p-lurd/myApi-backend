import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiMonitorService } from './api-monitor.service';

@Injectable()
export class CronService {
  constructor(private readonly apiMonitorService: ApiMonitorService) {}

  @Cron('*/6 * * * * *') // Runs every 6 seconds
  // @Cron('*/5 * * * *') // Runs every 5 minutes
  async handleCron() {
    console.log("cron started")
    await this.apiMonitorService.fetchAndQueueApis();
  }
}
