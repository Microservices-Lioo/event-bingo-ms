import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from "class-validator";

export class CreateManyCardDto {

    @IsUUID()
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsUUID()
    @IsString()
    @IsNotEmpty()
    eventId: string;

    @IsUUID()
    @IsString()
    @IsNotEmpty()
    buyer: string;

    @IsNumber()
    @IsPositive()
    totalItems: number;

}
