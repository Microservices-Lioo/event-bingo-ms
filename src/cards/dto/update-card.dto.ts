import { IsBoolean, IsNumber, IsOptional, IsPositive, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCardDto {
    @IsNumber()
    @IsPositive()
    id: number;

    @IsNumber()
    @IsPositive()
    buyer: number;

    @IsOptional()
    @IsNumber({
        maxDecimalPlaces: 4
    })
    @IsPositive()
    @Type( () => Number)
    price: number;

    @IsOptional()
    @IsBoolean()
    available: boolean;
}