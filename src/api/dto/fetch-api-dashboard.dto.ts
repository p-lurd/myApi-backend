import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FetchApiStatusDto {
  // @IsString()
  // businessId: string; // required

  @IsOptional()
  @Type(() => Number) // transform to number
  @IsNumber()
  @Min(1)
  page: number = 1; // optional, default 1

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 30; // optional, default 30

  @IsOptional()
  @IsString()
  apiIdFilter?: string; // optional
}
