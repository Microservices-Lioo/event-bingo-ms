import { PartialType } from '@nestjs/mapped-types';
import { CreateAwardDto } from './create-award.dto';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateAwardDto extends PartialType(CreateAwardDto) {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  num_award: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  winner_user: number;
  
  @IsOptional()
  @IsNumber()
  @IsPositive()
  gameId: number;
}
