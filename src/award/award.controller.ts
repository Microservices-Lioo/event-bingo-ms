import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AwardService } from './award.service';
import { CreateAwardDto } from './dto/create-award.dto';
import { UpdateAwardDto } from './dto/update-award.dto';

@Controller()
export class AwardController {
  constructor(private readonly awardService: AwardService) {}

  @MessagePattern('createAward')
  create(
    @Payload() award: CreateAwardDto,
  ) {
    const data = new Array(award);
    return this.awardService.create(data);
  }

  @MessagePattern('createAwards')
  createMany(
    @Payload() award: CreateAwardDto[],
  ) {
    return this.awardService.create(award);
  }

  @MessagePattern('findOneAward')
  findOne(@Payload('id', new ParseUUIDPipe()) id: string) {
    return this.awardService.findOne(id);
  }

  @MessagePattern('findAllByEventAward')
  findAllByEvent(@Payload() eventId: string) {
    return this.awardService.findAllByEvent(eventId);
  }

  @MessagePattern('findAllWinnersByEventAward')
  findAllWinnersByEvent(@Payload() eventId: string) {
    return this.awardService.findAllWinnersByEvent(eventId);
  }

  @MessagePattern('updateAward')
  update(@Payload() updateAwardDto: UpdateAwardDto) {
    return this.awardService.update(updateAwardDto);
  }

  @MessagePattern('removeAward')
  remove(@Payload() id: string) {
    return this.awardService.remove(id);
  }
}
