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
