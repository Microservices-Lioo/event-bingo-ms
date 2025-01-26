import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto, DeleteDto } from './common';

@Controller()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @MessagePattern('createEvent')
  create(@Payload() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @MessagePattern('findAllEvent')
  findAll() {
    return this.eventService.findAll();
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
