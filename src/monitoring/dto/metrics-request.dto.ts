import { IsString, IsDateString, IsNotEmpty, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetMetricsDto {
  @IsNotEmpty()
  @IsMongoId()
  apiId: string;

  @IsDateString()
  @Transform(({ value }) => {
    const date = new Date(value);
    return date.toISOString().split('T')[0];
  })
  startDate: string;

  @IsDateString()
  @Transform(({ value }) => {
    const date = new Date(value);
    return date.toISOString().split('T')[0];
  })
  endDate: string;
}