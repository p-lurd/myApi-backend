import * as mongoose from 'mongoose';
 
// Define the schema
export const ApiResponseSchema = new mongoose.Schema({
    url: { type: String, unique: true, required: true },
    apiId: { type: mongoose.Schema.Types.ObjectId, ref: 'Api', unique: false, required: true },
    statusCode:{ type: Number, required: true},
    responseTime: { type: Number, required: true},
    success: {type: Boolean, required: true},
    businessId: { type: mongoose.Schema.Types.ObjectId, unique: false, required: true},
    
}, {
    timestamps: true,
});

// TypeScript interface for the document
export interface ApiResponse {
    url: string;
    apiId: mongoose.Types.ObjectId;
    statusCode: Number;
    responseTime: Number;
    success: Boolean;
    businessId: mongoose.Types.ObjectId;
    createdAt: Date;
}

// model name
export const ApiResponseModelName = 'ApiResponse';

// document type with Mongoose's Document
export type ApiResponseDocument = ApiResponse & mongoose.Document;