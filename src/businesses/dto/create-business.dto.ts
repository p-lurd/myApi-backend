import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { ROLES } from "src/utilities/userRoles.enum";

export class CreateBusinessDto {
    name: string;
    email: string;
    githubId: string;
    ownerId: string;
}
export class CreateUserBusinessDto {
    name: string;
    businessId: string;
    userId: string;
    email: string;
    role: ROLES
}
// export class CreateUserBusinessDto {
//     @IsString()
//     name: string;
    
//     @IsString()
//     businessId: string;
    
//     @IsEmail()
//     email: string;
    
//     @IsEnum(ROLES)
//     @Transform(({ value }) => typeof value === 'string' ? ROLES[value] : value)
//     role: ROLES;
    
//     @IsOptional()
//     @IsString()
//     userId?: string;
//   }