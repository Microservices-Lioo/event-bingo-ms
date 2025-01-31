import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AwardService } from './award.service';
import { CreateAwardDto } from './dto/create-award.dto';
import { UpdateAwardDto } from './dto/update-award.dto';

@Controller()
export class AwardController {
  constructor(private readonly awardService: AwardService) {}

  @MessagePattern('createAward')
  create(@Payload() payload: { createAwardDto: CreateAwardDto, userId: number}) {
    const { createAwardDto, userId } = payload;
    return this.awardService.create(createAwardDto, userId);
  }

  @MessagePattern('findAllByEventAward')
  findAllByEvent(@Payload() eventId: number) {
    return this.awardService.findAllByEvent(eventId);
  }

  @MessagePattern('findAllWinnersByEventAward')
  findAllWinnersByEvent(@Payload() eventId: number) {
    return this.awardService.findAllWinnersByEvent(eventId);
  }

  @MessagePattern('findOneAward')
  findOne(@Payload() id: number) {
    return this.awardService.findOne(id);
  }

  @MessagePattern('updateAward')
  update(@Payload() updateAwardDto: UpdateAwardDto) {
    return this.awardService.update(updateAwardDto.id, updateAwardDto);
  }

  @MessagePattern('removeAward')
  remove(@Payload() id: number) {
    return this.awardService.remove(id);
  }
}
