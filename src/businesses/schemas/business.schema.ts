import * as mongoose from 'mongoose';
 
// Define the schema
export const BusinessSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    githubId: { type: String, unique: true},
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true,
});

// TypeScript interface for the document
export interface Business {
    name: string;
    email: string;
    githubId?: String;
    createdAt: Date;
    owner: mongoose.Types.ObjectId;
}

// model name
export const BusinessModelName = 'Business';

// document type with Mongoose's Document
export type BusinessDocument = Business & mongoose.Document;