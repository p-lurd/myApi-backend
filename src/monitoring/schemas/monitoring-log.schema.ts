import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MonitoringLogDocument = MonitoringLog & Document;

@Schema({ timestamps: true })
export class MonitoringLog {
  @Prop({ required: true, type: Types.ObjectId })
  apiId: Types.ObjectId;

  @Prop({ required: true })
  apiName: string;

  @Prop({ required: true, type: Types.ObjectId })
  businessId: Types.ObjectId;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  responsetime: number;

  @Prop({ required: true })
  statuscode: number;

  @Prop({ required: true })
  success: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const MonitoringLogSchema = SchemaFactory.createForClass(MonitoringLog);


MonitoringLogSchema.index({ apiId: 1, createdAt: -1 });
MonitoringLogSchema.index({ businessId: 1, createdAt: -1 });
MonitoringLogSchema.index({ createdAt: -1 });