import { PartialType } from '@nestjs/mapped-types';
import { CreateAwardDto } from './create-award.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateAwardDto extends PartialType(CreateAwardDto) {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsUUID()
  gameId?: string;

  @IsOptional()
  @IsUUID()
  winner?: string;
}
