import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { StatusEvent } from '../enums';
import { Type } from 'class-transformer';
import { IsDateLongerToday } from 'src/common';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsOptional()
  @IsEnum(StatusEvent, {
    message: 'The status must be one of the following: TODAY, NOW, PROGRAMMED, COMPLETED'
  })
  status: StatusEvent;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsDateLongerToday()
  start_time: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsDateLongerToday()
  end_time: Date;
}
