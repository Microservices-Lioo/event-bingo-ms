import { Controller, ParseIntPipe } from '@nestjs/common';
import { CardsService } from './cards.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { CheckOrUncheckDto, CreateCardDto, CreateManyCardDto, UpdateAvailableDto, UpdateAvailableManyDto } from './dto';
import { ParamIdBuyerEventDto } from 'src/event/common/dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @MessagePattern('createCard')
  create(@Payload() createCardDto: CreateCardDto) {
    return this.cardsService.create(createCardDto);
  }
  
  @MessagePattern('findOneCard')
  findOne(@Payload() id: string) {
    return this.cardsService.findOne(id);
  }

  @MessagePattern('findAllIdsCard')
  findAllIds(@Payload() ids: string[]) {
    return this.cardsService.findAllIds(ids);
  }

  @MessagePattern('findOneByIdBuyerEvent')
  findOneByIdBuyerEvent( @Payload() payloadDto: ParamIdBuyerEventDto) {
    return this.cardsService.findOneByIdBuyerEvent(payloadDto);
  }
  
  @MessagePattern('findAllCardsByEvent')
  findAllCardsByEvent(
    @Payload() payload: { eventId: string, paginationDto: PaginationDto}
  ) {
    const { eventId, paginationDto } = payload;
    return this.cardsService.findAllByEvent(eventId, paginationDto);
  }

  @MessagePattern('countAllCardsByEvent')
  countAllCardsByEvent(
    @Payload() eventId: string
  ) {
    return this.cardsService.countAllCardsByEvent(eventId);
  }

  @MessagePattern('updateAvailableCard')
  updateAvailable(
    @Payload() updateAvailableDto: UpdateAvailableDto
  ) {
    return this.cardsService.updateAvailable(updateAvailableDto);
  }

  @MessagePattern('updateAvailableManyCard')
  updateAvailableMany(
    @Payload() payload: UpdateAvailableManyDto
  ) {
    return this.cardsService.updateAvailableMany(payload);
  }

  @MessagePattern('getCardCountForUserAndEvent')
  getCardCountForUserAndEvent(
    @Payload() payload: { buyer: string, eventId: string }
  ) {
    return this.cardsService.getCardCountForUserAndEvent(payload);
  }

  @MessagePattern('findToEventByBuyer')
  findToEventByBuyer( 
    @Payload() payload: { buyer: string, eventId: string }
  ) {
    const { buyer, eventId } = payload;
    return this.cardsService.findToEventByBuyer(buyer, eventId);
  }

  @MessagePattern('checkOrUncheckBox')
  checkOrUncheckBox(
    @Payload() checkOrUncheckDto: CheckOrUncheckDto
  ) {
    return this.cardsService.checkOrUncheckBox(checkOrUncheckDto);
  }

  @MessagePattern('validateCards')
  validateCards(
    @Payload() ids: string[]
  ) {
    return this.cardsService.validateCards(ids);
  }

  @MessagePattern('removeCards')
  removeCards(@Payload() ids: string[]) {
    return this.cardsService.removeCards(ids);
  }
}
