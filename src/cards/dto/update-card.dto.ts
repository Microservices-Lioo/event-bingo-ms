import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdateCardDto extends PartialType(CreateCardDto) {

    @IsNumber()
    @IsPositive()
    id: number;
}
