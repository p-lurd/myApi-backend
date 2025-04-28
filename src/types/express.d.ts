import { UserDocument } from '../users/schemas/user.schema'; // adjust to your user type

declare module 'express' {
  interface Request {
    user?: UserDocument;
  }
}