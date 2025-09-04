import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class IdDto {
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    id: string;
}

export class EmailDto {
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string;
}