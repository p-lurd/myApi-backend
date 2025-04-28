import * as mongoose from 'mongoose';
import { ROLES } from 'src/utilities/userRoles.enum';
 
// Define the schema
export const BusinessUserSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    userEmail:{type: String, required: true},
    role: { 
        type: String, 
        enum: [ROLES.admin, ROLES.superAdmin],
        default: ROLES.admin
    },
}, {
    timestamps: true,
});

// TypeScript interface for the document
export interface BusinessUser {
    createdAt: Date;
    userId?: mongoose.Types.ObjectId;
    businessId: mongoose.Types.ObjectId;
    userEmail: String;
    role: ROLES
}

// model name
export const BusinessUserModelName = 'BusinessUser';

// document type with Mongoose's Document
export type BusinessUserDocument = BusinessUser & mongoose.Document;