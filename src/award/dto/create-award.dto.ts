import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreateAwardDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsPositive()
    eventId: number;
}
