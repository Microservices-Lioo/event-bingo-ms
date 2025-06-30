import { Controller, ParseIntPipe } from '@nestjs/common';
import { CardsService } from './cards.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { CreateCardDto, CreateManyCardDto, UpdateAvailableDto } from './dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @MessagePattern('createCard')
  create(@Payload() createCardDto: CreateCardDto) {
    return this.cardsService.create(createCardDto);
  }

  @MessagePattern('createManyCard')
  createManyCards(
    @Payload() createManyCardDto: CreateManyCardDto,
  ) {
    return this.cardsService.createMany(createManyCardDto);
  }
  
  @MessagePattern('findOneCard')
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.cardsService.findOne(id);
  }
  
  @MessagePattern('findAllCardsByEvent')
  findAllCardsByEvent(
    @Payload() payload: { eventId: number, paginationDto: PaginationDto}
  ) {
    const { eventId, paginationDto } = payload;
    return this.cardsService.findAllCardsByEvent(eventId, paginationDto);
  }

  @MessagePattern('countAllCardsByEvent')
  countAllCardsByEvent(
    @Payload() eventId: number
  ) {
    return this.cardsService.countAllCardsByEvent(eventId);
  }

  @MessagePattern('updateAvailableCard')
  updateAvailable(
    @Payload() updateAvailableDto: UpdateAvailableDto
  ) {
    return this.cardsService.updateAvailable(updateAvailableDto);
  }

  @MessagePattern('getCardCountForUserAndEvent')
  getCardCountForUserAndEvent(
    @Payload() payload: { buyer: number, eventId: number }
  ) {
    return this.cardsService.getCardCountForUserAndEvent(payload);
  }

  @MessagePattern('findToEventByBuyer')
  findToEventByBuyer( 
    @Payload() payload: { buyer: number, eventId: number }
  ) {
    const { buyer, eventId } = payload;
    return this.cardsService.findToEventByBuyer(buyer, eventId);
  }

}
