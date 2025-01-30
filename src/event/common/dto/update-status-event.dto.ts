import { IsEnum, IsNumber, IsOptional, IsPositive } from "class-validator";
import { StatusEvent } from "../enums";

export class UpdateStatusEventDto {
    @IsNumber()
    @IsPositive()
    userId: number;

    @IsNumber()
    @IsPositive()
    eventId: number;
    
    @IsOptional()
      @IsEnum(StatusEvent, {
        message: 'The status must be one of the following: TODAY, NOW, PROGRAMMED, COMPLETED'
      })
    status: StatusEvent;

}