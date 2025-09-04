import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from "class-validator";

export class CreateCardDto {
    @IsNumber()
    @IsPositive()
    quantity: number;
    
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    eventId: string;

    @IsUUID()
    @IsString()
    @IsNotEmpty()
    buyer: string;

}
