import { IsBoolean, IsNumber, IsOptional, IsPositive, IsUUID } from "class-validator";

export class CheckOrUncheckDto {
    @IsUUID()
    cardId: string;

    @IsNumber()
    @IsPositive()
    markedNum: number;

    @IsOptional()
    @IsBoolean()
    marked: boolean;

    @IsUUID()
    userId: string;
}