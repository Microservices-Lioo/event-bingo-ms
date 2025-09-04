import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from "class-validator"
import { IsDateLongerToday } from "src/common/decorators";

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()    
    name: string;
    
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsUUID()
    @IsString()
    @IsNotEmpty()
    userId: string;    

    @IsNumber({
        maxDecimalPlaces: 4
    })
    @IsPositive()
    @Type( () => Number)
    price: number;

    @Type(() => Date)
    @IsDate()
    @IsDateLongerToday()
    start_time: Date;
}
