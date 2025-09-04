import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { StatusEvent } from "../enums";

export class UpdateStatusEventDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsUUID()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsEnum(StatusEvent, {
    message: 'El status debe ser uno de los siguientes: PENDING, ACTIVE, CANCELLED, COMPLETED'
  })
  status: StatusEvent;

}