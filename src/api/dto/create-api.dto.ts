export class CreateApiDto {
  url: string;
  apiName: string;
  businessId: Number;
  options?: object;
}

export class CreateApiResponseDto {
  url: string;
  apiName: string;
  apiId: Number;
  statusCode: Number;
  responseTime: Number;
  success: Boolean;
  businessId: Number;
}
