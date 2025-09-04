import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from "class-validator";

export class CheckOrUncheckDto {
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    cardId: string;

    @IsNumber()
    @IsPositive()
    markedNum: number;

    @IsOptional()
    @IsBoolean()
    marked: boolean;

    @IsUUID()
    @IsString()
    @IsNotEmpty()
    userId: string;
}