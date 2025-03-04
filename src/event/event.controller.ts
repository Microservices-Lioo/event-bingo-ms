import { StatusEvent } from './common/enums/status.enum';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventService } from './event.service';
import { CreateEventDto, DeleteEventDto, UpdateEventDto, UpdateStatusEventDto } from './common';
import { PaginationDto } from 'src/common';

@Controller()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @MessagePattern('createEvent')
  create(@Payload() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @MessagePattern('findAllStatusEvent')
  findAllStatus(@Payload() payload: { pagination: PaginationDto, status: StatusEvent }) {
    return this.eventService.findAllStatus(payload);
  }

  @MessagePattern('findAllByUserStatusEvent')
  findAllByUserStatus(
    @Payload() payload: { pagination: PaginationDto, status: StatusEvent, userId: number }) {
    return this.eventService.findAllByUserStatus(payload);
  }

  @MessagePattern('findAllEvent')
  findAll(@Payload() pagination: PaginationDto) {
    return this.eventService.findAll(pagination);
  }

  @MessagePattern('findByUserEvent')
  findByUser(@Payload() payload: { id: number, pagination: PaginationDto}) {
    const { id, pagination } = payload;
    return this.eventService.findAllByUser(id, pagination);
  }

  @MessagePattern('findByUserWithAwardsEvent')
  findByUserWithAwards(@Payload() payload: { id: number, pagination: PaginationDto }) {
    const { id, pagination } = payload;
    return this.eventService.findAllByUserWithAwards(id, pagination);
  }

  @MessagePattern('findOneEvent')
  findOne(@Payload() id: number) {
    return this.eventService.findOne(id);
  }

  @MessagePattern('findOneWithAwardEvent')
  findOneWithAward(@Payload() eventId: number) {
    return this.eventService.findOneWithAward(eventId);
  }

  @MessagePattern('updateEvent')
  update(@Payload() updateEventDto: UpdateEventDto) {
    return this.eventService.update(updateEventDto.id, updateEventDto);
  }

  @MessagePattern('updateStatusEvent')
  updateStatus(@Payload() updateEventDto: UpdateStatusEventDto) {
    return this.eventService.updateStatus(updateEventDto);
  }

  @MessagePattern('removeEvent')
  remove(@Payload() deletDto: DeleteEventDto) {
    return this.eventService.remove(deletDto);
  }
}
