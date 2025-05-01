import { Exclude, Expose } from 'class-transformer';

export class FilteredUserDto {
    @Expose() _id: string;
    @Expose() name: string;
    @Expose() email: string;
    @Expose() avartar: string;
    @Expose() githubId: string;
    @Expose() createdAt: Date;
    @Expose() updatedAt: Date;

    @Exclude()
    password: string;

    @Exclude()
    __v?: number;

    constructor(partial: Partial<FilteredUserDto>) {
        Object.assign(this, partial);
    }
}
