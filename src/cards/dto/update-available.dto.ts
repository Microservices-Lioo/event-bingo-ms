import { IsNumber, IsPositive } from "class-validator";

export class UpdateAvailableDto {
    @IsNumber()
    @IsPositive()
    eventId: number;

    @IsNumber()
    @IsPositive()
    userId: number;

    @IsNumber()
    @IsPositive()
    cardId: number;
}