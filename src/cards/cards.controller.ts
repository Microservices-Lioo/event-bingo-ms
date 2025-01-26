import { Controller, ParseIntPipe } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
// import { PaginationDto } from 'src/commons';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @MessagePattern({ cmd: 'create-card' })
  create(@Payload() createCardDto: CreateCardDto) {
    return this.cardsService.create(createCardDto);
  }

  // @Get('/event/:event')
  // @MessagePattern({ cmd: 'find-all-event' })
  // findAllCardsEvent(@Payload() payload: { event: number, paginationDto: PaginationDto}) {
  //   const { event, paginationDto } = payload;
  //   return this.cardsService.findAllEvent(event, paginationDto);
  // }

  // @Get(':id')
  // @MessagePattern({ cmd: 'find_one' })
  // findOne(@Payload('id', ParseIntPipe) id: number) {
  //   return this.cardsService.findOne(id);
  // }

  // @Patch(':id')
  // @MessagePattern({ cdm: 'update-card' })
  // update(
    // @Param('id') id: string, 
    // @Body() updateCardDto: UpdateCardDto
  //   @Payload() updateCardDto: UpdateCardDto
  // ) {
  //   return this.cardsService.update(updateCardDto.id, updateCardDto);
  // }

  // @Delete(':id')
  // @MessagePattern({ cmd: 'remove-card' })
  // remove(@Payload('id', ParseIntPipe) id: number) {
  //   return this.cardsService.remove(id);
  // }
}
