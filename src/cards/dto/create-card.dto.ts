import { Type } from "class-transformer";
import { IsNumber, Min } from "class-validator";

export class CreateCardDto {

    @IsNumber()
    eventId: number;

    @IsNumber()
    buyer: number;

    @IsNumber({
        maxDecimalPlaces: 4
    })
    @Min(0)
    @Type( () => Number)
    price: number;

}
