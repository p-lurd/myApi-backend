import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {ROLES} from 'src/utilities/userRoles.enum';
import { BusinessAuthService } from './business-auth.service';
import { BUSINESS_ROLES_KEY, REQUIRE_SUPERADMIN_KEY } from './business-roles.decorator';

@Injectable()
export class BusinessRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private businessAuthService: BusinessAuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if handler requires superadmin
    const requireSuperAdmin = this.reflector.get<boolean>(
      REQUIRE_SUPERADMIN_KEY,
      context.getHandler()
    );
    
    // Check if handler requires specific business roles
    const requiredRoles = this.reflector.get<ROLES[]>(
      BUSINESS_ROLES_KEY,
      context.getHandler()
    );
    
    // If no roles or superadmin are required, allow access
    if (!requiredRoles && !requireSuperAdmin) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // If no user is attached to the request, deny access
    if (!user || !user._id) {
      throw new ForbiddenException('Authentication required');
    }

    // If superadmin is required anywhere, check that first
    if (requireSuperAdmin) {
      const isSuperAdmin = await this.businessAuthService.isSuperAdmin(user._id);
      if (isSuperAdmin) {
        return true;
      } else if (!requiredRoles) {
        // If only superadmin was required and user isn't one, deny
        throw new ForbiddenException('Superadmin privileges required');
      }
      // Otherwise, fall through to the regular role check
    }

    // Get businessId from request (from route param, query param, or body)
    const businessId = 
      request.params.businessId || 
      request.query.businessId || 
      (request.body && request.body.businessId);
    
    if (!businessId) {
      throw new ForbiddenException('Business ID is required for this operation');
    }

    // Check if user has required role in this business
    const hasRole = await this.businessAuthService.hasRole(
      user._id, 
      businessId, 
      requiredRoles
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Required role for this business: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}