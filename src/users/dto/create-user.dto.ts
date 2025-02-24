export class CreateUserDto {
    name: string;
    email: string;
    password?: string;
    avartar?: string;
    githubId?: string;
}

export class UserDto {
    _id: string;
    name: string;
    email: string;
    createdAt: Date;
    avatar: string;
    password?: string;
}
