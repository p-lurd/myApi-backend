import * as mongoose from 'mongoose';
 
// Define the schema
export const ApiSchema = new mongoose.Schema({
    // _id: { type: ObjectId, unique: true, default:new ObjectId()},
    url: { type: String, unique: true, required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref:'Business', unique: false, required: true},
    options:{type:Object, required: false},
    apiName: { type: String, unique: false, required: true },
}, {
    timestamps: true,
});

// TypeScript interface for the document
export interface Api {
    url: string;
    businessId: string;
    options?: Object;
    apiName: string;
    createdAt: Date;
}

// model name
export const ApiModelName = 'Api';

// document type with Mongoose's Document
export type ApiDocument = Api & mongoose.Document;