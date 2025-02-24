import * as mongoose from 'mongoose';
 
// Define the schema
export const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    githubId: { type: String, unique: true},
    avatar: { type: String, required: false },
    password: { type: String, required: false}
}, {
    timestamps: true,
});

// TypeScript interface for the document
export interface User {
    name: string;
    email: string;
    githubId?: String;
    createdAt: Date;
    avatar?: string;
    password?: string;
}

// model name
export const UserModelName = 'User';

// document type with Mongoose's Document
export type UserDocument = User & mongoose.Document;