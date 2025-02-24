import { HttpException,HttpStatus } from "@nestjs/common";


export class userAlreadyExists extends HttpException{
    constructor(intCode: string){
        super({message: 'user already exists', intCode}, HttpStatus.CONFLICT)
    }
}

export class userNotCreated extends HttpException {
    constructor(intCode: string){
        super({message: 'user not created', intCode}, HttpStatus.INTERNAL_SERVER_ERROR)
    }
}

export class userValidationFailed extends HttpException {
    constructor(intCode: string){
        super({message: 'user validation failed', intCode}, HttpStatus.INTERNAL_SERVER_ERROR)
    }
}