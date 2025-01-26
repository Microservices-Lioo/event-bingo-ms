import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsString, Min } from "class-validator"

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()    
    name: string;
    
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @Min(1)
    userId: number;    

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    start_time: Date;
}
