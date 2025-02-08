import { forwardRef, HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateAwardDto } from './dto/create-award.dto';
import { UpdateAwardDto } from './dto/update-award.dto';
import { PrismaClient } from '@prisma/client';
import { EventService } from 'src/event/event.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AwardService extends PrismaClient implements OnModuleInit {
  
  private readonly logger = new Logger('Award-Service');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }
  constructor(
    @Inject(forwardRef(() => EventService))
    private readonly eventServ: EventService
  ) { super(); }

  async create(createAwardDto: CreateAwardDto, userId: number) {
    
    await this.eventServ.findByUser(userId, createAwardDto.eventId);
    
    const award = await this.award.create({
      data: createAwardDto
    });

    return award;
  }

  async createMulti(createAwardDto: CreateAwardDto[], userId: number) {
    
    await this.eventServ.findByUser(userId, createAwardDto[0].eventId);
    
    const award = await this.award.createMany({
      data: createAwardDto
    });

    return award;
  }

  async findAllByEvent(eventId: number) {
    const awards = await this.award.findMany({
      where: {
        eventId
      }
    });    
    return awards;
  }

  async findAllWinnersByEvent(eventId: number) {
    const awards = await this.award.findMany({
      where: {
        eventId
      },
      select: {
        winner_user: true
      }
    });

    return awards.map(a => a.winner_user);
  }

  async findOne(id: number) {
    const award = await this.award.findFirst({
      where: {
        id
      }
    });

    if (!award) throw new RpcException({
      status: HttpStatus.NOT_FOUND,
      message: `Award with id #${id} not found`,
    });

    return award;
  }

  async update(updateAwardDto: UpdateAwardDto) {
    const { id, ...data } = updateAwardDto;

    const awardOld = await this.findOne(id);

    if (!data.eventId || awardOld.eventId != data.eventId) throw new RpcException({
      status: HttpStatus.CONFLICT,
      message: `The award does not belong to this event`,
      error: 'conflict_eventid_award'
    });

    const award = await this.award.update({
      data: data,
      where: {
        id
      }
    });

    return award;
  }

  async remove(id: number) {
    const award = await this.findOne(id);

    if (award.gameId != null || award.num_award != null || award.winner_user != null ) throw new RpcException({
      status: HttpStatus.CONFLICT,
      message: `This award is already won`,
      error: 'confict_won_award'
    });
    
    await this.award.delete({
      where: {
        id
      }
    });

    return id;
  }
}
