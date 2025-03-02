export class CreateApiDto {
  url: string;
  businessId: Number;
  options?: object;
}

export class CreateApiResponseDto {
  url: string;
  apiId: Number;
  statusCode: Number;
  responseTime: Number;
  success: Boolean;
  businessId: Number;
}
