import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateEventDto } from './common/dto/create-event.dto';
import { UpdateEventDto } from './common/dto/update-event.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

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

  async findOne(id: number) {
    const event = await this.event.findFirst({
      where: {
        id
      }
    });

    if (!event) throw new RpcException({
      status: HttpStatus.NOT_FOUND,
      message: `This event with id #${id} not found`
    });

    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    await this.findOne(id);
    const event = await this.event.update({
      data: updateEventDto,
      where: {
        id
      }
    })
    return event;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
