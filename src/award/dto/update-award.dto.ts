import { PartialType } from '@nestjs/mapped-types';
import { CreateAwardDto } from './create-award.dto';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateAwardDto extends PartialType(CreateAwardDto) {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsOptional()
  @IsUUID()
  @IsString()
  gameId?: string;

  @IsOptional()
  @IsUUID()
  @IsString()
  winner?: string;
}
