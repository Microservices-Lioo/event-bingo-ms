import { PartialType } from '@nestjs/mapped-types';
import { CreateAwardDto } from './create-award.dto';
import { IsNumber } from 'class-validator';

export class UpdateAwardDto extends PartialType(CreateAwardDto) {
  @IsNumber()
  id: number;
}
