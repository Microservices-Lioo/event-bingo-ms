import { IsBoolean, IsNumber, IsOptional, IsPositive } from "class-validator";

export class CheckOrUncheckDto {
    @IsNumber()
    @IsPositive()
    cardId: number;

    @IsNumber()
    @IsPositive()
    markedNum: number;

    @IsOptional()
    @IsBoolean()
    marked: boolean;

    @IsNumber()
    @IsPositive()
    userId: number;
}