import * as mongoose from 'mongoose';
 
// Define the schema
export const ApiResponseSchema = new mongoose.Schema({
    url: { type: String, unique: false, required: true },
    apiName:{ type: String, unique: false, required: true },
    apiId: { type: mongoose.Schema.Types.ObjectId, ref: 'Api', unique: false, required: true },
    statuscode:{ type: Number, required: true},
    responsetime: { type: Number, required: true},
    success: {type: Boolean, required: true},
    businessId: { type: mongoose.Schema.Types.ObjectId, unique: false, required: true},
    
}, {
    timestamps: true,
});

// TypeScript interface for the document
export interface ApiResponse {
    url: string;
    apiName: string;
    apiId: mongoose.Types.ObjectId;
    statuscode: Number;
    responsetime: Number;
    success: Boolean;
    businessId: mongoose.Types.ObjectId;
    createdAt: Date;
}

// model name
export const ApiResponseModelName = 'ApiResponse';

// document type with Mongoose's Document
export type ApiResponseDocument = ApiResponse & mongoose.Document;