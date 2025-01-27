import { Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @MessagePattern('createCard')
  create(@Payload() createCardDto: CreateCardDto) {
    return this.cardsService.create(createCardDto);
  }
  
  @Get(':id')
  @MessagePattern('findOneCard')
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.cardsService.findOne(id);
  }
  
  @Get('/event/:eventId')
  @MessagePattern('findAllCardsByEvent')
  findAllCardsByEvent(
    @Payload() payload: { eventId: number, paginationDto: PaginationDto}
  ) {
    const { eventId, paginationDto } = payload;
    return this.cardsService.findAllCardsByEvent(eventId, paginationDto);
  }

  @Patch(':id')
  @MessagePattern('updateCard')
  update(
    @Payload() updateCardDto: UpdateCardDto
  ) {
    return this.cardsService.update(updateCardDto);
  }

  // @Delete(':id')
  // @MessagePattern({ cmd: 'remove-card' })
  // remove(@Payload('id', ParseIntPipe) id: number) {
  //   return this.cardsService.remove(id);
  // }
}
