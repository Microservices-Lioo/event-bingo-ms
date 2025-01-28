import { IsBoolean, IsNumber, IsOptional, IsPositive, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCardDto {
    @IsNumber()
    @IsPositive()
    id: number;

    @IsNumber()
    @IsPositive()
    buyer: number;

    @IsNumber()
    @IsPositive()
    eventId: number;

    @IsNumber()
    @IsPositive()
    userId: number;

    @IsOptional()
    @IsBoolean()
    available: boolean;
}