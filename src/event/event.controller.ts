import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto, DeleteDto } from './common';
import { PaginationDto } from 'src/common';

@Controller()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @MessagePattern('createEvent')
  create(@Payload() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @MessagePattern('findAllNowEvent')
  findAllNow(@Payload() pagination: PaginationDto) {
    return this.eventService.findAllNow(pagination);
  }

  @MessagePattern('findAllTodayEvent')
  findAllToday(@Payload() pagination: PaginationDto) {
    return this.eventService.findAllToday(pagination);
  }

  @MessagePattern('findAllProgrammedEvent')
  findAllProgrammed(@Payload() pagination: PaginationDto) {
    return this.eventService.findAllProgrammed(pagination);
  }

  @MessagePattern('findAllEvent')
  findAll(@Payload() pagination: PaginationDto) {
    return this.eventService.findAll(pagination);
  }

  @MessagePattern('findForUserEvent')
  findForUser(@Payload() id: number) {
    return this.eventService.findForUser(id);
  }

  @MessagePattern('findOneEvent')
  findOne(@Payload() id: number) {
    return this.eventService.findOne(id);
  }

  @MessagePattern('updateEvent')
  update(@Payload() updateEventDto: UpdateEventDto) {
    return this.eventService.update(updateEventDto.id, updateEventDto);
  }

  @MessagePattern('removeEvent')
  remove(@Payload() deletDto: DeleteDto) {
    return this.eventService.remove(deletDto);
  }
}
