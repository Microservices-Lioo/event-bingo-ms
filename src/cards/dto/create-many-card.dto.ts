import { IsNumber, IsPositive } from "class-validator";

export class CreateManyCardDto {

    @IsNumber()
    @IsPositive()
    eventId: number;

    @IsNumber()
    @IsPositive()
    buyer: number;

    @IsNumber()
    @IsPositive()
    totalItems: number;

}
