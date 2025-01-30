import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class CreateCardDto {

    @IsNumber()
    @IsPositive()
    eventId: number;

    @IsNumber()
    @IsPositive()
    buyer: number;

}
