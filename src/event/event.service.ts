import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateEventDto } from './common/dto/create-event.dto';
import { UpdateEventDto } from './common/dto/update-event.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class EventService extends PrismaClient implements OnModuleInit {
  
  private readonly logger = new Logger('Events-Service');

  async onModuleInit() {
    await this.$connect(); 
  }

  async create(createEventDto: CreateEventDto) {
    const event = await this.event.create({
      data: createEventDto
    });

    return event;
  }

  findAll() {
    return `This action returns all event`;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
