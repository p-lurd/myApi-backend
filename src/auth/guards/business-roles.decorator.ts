import { SetMetadata } from '@nestjs/common';
import {ROLES} from 'src/utilities/userRoles.enum';

export const BUSINESS_ROLES_KEY = 'business_roles';
export const RequireBusinessRoles = (...roles: ROLES[]) => 
  SetMetadata(BUSINESS_ROLES_KEY, roles);

// For routes that need superadmin access across any business
export const REQUIRE_SUPERADMIN_KEY = 'require_superadmin';
export const RequireSuperAdmin = () => 
  SetMetadata(REQUIRE_SUPERADMIN_KEY, true);