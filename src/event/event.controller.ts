import { StatusEvent } from './common/enums/status.enum';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventService } from './event.service';
import { IdDto, PaginationDto } from 'src/common';
import { CreateAwardDto } from 'src/award/dto';
import { CreateEventDto, PaginationStatusDto, UpdateEventDto, UpdateStatusEventDto, DeleteEventDto, ParamIdEventUserDto } from './common/dto';

@Controller()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @MessagePattern('createEvent')
  create(
    @Payload('event') createEventDto: CreateEventDto,
    @Payload('awards') createAwardDto: CreateAwardDto[]
  ) {
    return this.eventService.create(createEventDto, createAwardDto);
  }

  @MessagePattern('findAllStatusEvent')
  findAllStatus(@Payload() payload: PaginationStatusDto) {
    return this.eventService.findAllStatus(payload);
  }

  @MessagePattern('findAllUserByStatusEvent')
  findAllUserByStatus(
    @Payload() payload: { pagination: PaginationDto, status: StatusEvent, userId: string }) {
    return this.eventService.findAllUserByStatus(payload);
  }

  @MessagePattern('findAllEvent')
  findAll(@Payload() pagination: PaginationDto) {
    return this.eventService.findAll(pagination);
  }

  @MessagePattern('findAllUserEvent')
  findAllUser(@Payload() data: { userId: string, pagination: PaginationDto}) {
    return this.eventService.findAllUser(data);
  }

  @MessagePattern('findAllUserWithAwardsEvent')
  findAllUserWithAwards(@Payload() payload: { id: string, pagination: PaginationDto }) {
    const { id, pagination } = payload;
    return this.eventService.findAllUserWithAwards(id, pagination);
  }

  @MessagePattern('findOneEvent')
  findOne(@Payload() idDto: IdDto) {
    return this.eventService.findOne(idDto.id);
  }

  @MessagePattern('findOneWithAwardsEvent')
  findOneWithAwards(@Payload() idDto: IdDto) {
    return this.eventService.findOneWithAwards(idDto.id);
  }

  @MessagePattern('updateEvent')
  update(@Payload() updateEventDto: UpdateEventDto) {
    return this.eventService.update(updateEventDto);
  }

  @MessagePattern('updateStatusEvent')
  updateStatus(@Payload() updateEventDto: UpdateStatusEventDto) {
    return this.eventService.updateStatus(updateEventDto);
  }

  @MessagePattern('removeEvent')
  remove(@Payload() deletDto: DeleteEventDto) {
    return this.eventService.remove(deletDto);
  }

  @MessagePattern('findOneByUserEvent')
  findOneByUser( @Payload() payload: ParamIdEventUserDto) {
    return this.eventService.findOneByUser(payload);
  }

  @MessagePattern('completedEvent')
  eventCompleted(@Payload() updateEventDto: UpdateEventDto) {
    return this.eventService.eventCompleted(updateEventDto);
  }
}
