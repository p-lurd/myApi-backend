import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; // Assuming Mongoose, adjust as needed
import { Model } from 'mongoose';
import {ROLES} from 'src/utilities/userRoles.enum';

interface BusinessUser {
  userId: string;
  businessId: string;
  role: ROLES;
}

@Injectable()
export class BusinessAuthService {
  constructor(
    @InjectModel('BusinessUser') private readonly businessUserModel: Model<BusinessUser>,
  ) {}

  /**
   * Check if a user has a specific role within a business
   */
  async hasRole(userId: string, businessId: string, roles: ROLES[]): Promise<boolean> {
    const businessUser = await this.businessUserModel.findOne({ 
      userId, 
      businessId 
    }).exec();

    if (!businessUser) {
      return false;
    }

    return roles.includes(businessUser.role);
  }

  /**
   * Check if a user is a superadmin in any business
   */
  async isSuperAdmin(userId: string): Promise<boolean> {
    const superAdminRelation = await this.businessUserModel.findOne({
      userId,
      role: ROLES.superAdmin
    }).exec();

    return !!superAdminRelation;
  }

  /**
   * Get all businesses where user has specific role(s)
   */
  async getBusinessesWithRole(userId: string, roles: ROLES[]): Promise<string[]> {
    const businessUsers = await this.businessUserModel.find({
      userId,
      role: { $in: roles }
    }).exec();

    return businessUsers.map(bu => bu.businessId);
  }

  /**
   * Get user's role in a specific business
   */
  async getUserRoleInBusiness(userId: string, businessId: string): Promise<ROLES | null> {
    const businessUser = await this.businessUserModel.findOne({ 
      userId, 
      businessId 
    }).exec();

    return businessUser ? businessUser.role : null;
  }
}