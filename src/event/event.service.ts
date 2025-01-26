import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateEventDto, UpdateEventDto, DeleteDto } from './common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { StatusEvent } from './common';

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

  async findAll() {
    const events = await this.event.findMany({
      where: {
        status: {
          not: StatusEvent.COMPLETED
        }
      }
    });

    return events;
  }

  async findForUser(id: number) {
    const events = await this.event.findMany({
      where: {
        userId: id
      }
    });

    return events;
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

  async remove(deletDto: DeleteDto) {
    const { id, userId } = deletDto;
    const event = await this.findOne(id);

    if (event.userId != userId) {
      throw new RpcException({
        status: HttpStatus.FORBIDDEN,
        message: `You are not allowed to delete this event`,
        error: 'forbidden_action'
      })
    }

    await this.event.delete({
      where: { id: id },
    });

    return event;
  }
}
