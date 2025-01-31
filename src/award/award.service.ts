import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateAwardDto } from './dto/create-award.dto';
import { UpdateAwardDto } from './dto/update-award.dto';
import { PrismaClient } from '@prisma/client';
import { EventService } from 'src/event/event.service';

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

  findAll() {
    return `This action returns all award`;
  }

  findOne(id: number) {
    return `This action returns a #${id} award`;
  }

  update(id: number, updateAwardDto: UpdateAwardDto) {
    return `This action updates a #${id} award`;
  }

  remove(id: number) {
    return `This action removes a #${id} award`;
  }
}
