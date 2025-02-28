import * as mongoose from 'mongoose';
 
// Define the schema
export const ApiSchema = new mongoose.Schema({
    url: { type: String, unique: true, required: true },
    businessId: { type: String, unique: false},
    options:{type:Object, required: false},
}, {
    timestamps: true,
});

// TypeScript interface for the document
export interface Api {
    url: string;
    businessId: String;
    options?: Object;
    createdAt: Date;
}

// model name
export const ApiModelName = 'Api';

// document type with Mongoose's Document
export type ApiDocument = Api & mongoose.Document;