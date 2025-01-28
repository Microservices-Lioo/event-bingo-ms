import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { StatusEvent } from '../enums';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsOptional()
  @IsEnum(StatusEvent, {
    message: 'The status must be one of the following: TODAY, NOW, PROGRAMMED, COMPLETED'
  })
  status: StatusEvent;
}
