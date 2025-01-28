import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateEventDto, UpdateEventDto, DeleteDto } from './common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { StatusEvent } from './common';
import { PaginationDto } from 'src/common';

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

  async findAllToday(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const total = await this.event.count({
      where: {
        status: {
          equals: StatusEvent.TODAY
        }
      }
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data: await this.event.findMany({
        where: {
          status: {
            equals: StatusEvent.TODAY
          }
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      meta: {
        total,
        page,
        lastPage
      }
    }
  }

  async findAllNow(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const total = await this.event.count({
      where: {
        status: {
          equals: StatusEvent.NOW
        }
      }
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data: await this.event.findMany({
        where: {
          status: {
            equals: StatusEvent.NOW
          }
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      meta: {
        total,
        page,
        lastPage
      }
    }
  }

  async findAllProgrammed(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const total = await this.event.count({
      where: {
        status: {
          equals: StatusEvent.PROGRAMMED
        }
      }
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data: await this.event.findMany({
        where: {
          status: {
            equals: StatusEvent.PROGRAMMED
          }
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      meta: {
        total,
        page,
        lastPage
      }
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const total = await this.event.count({
      where: {
        status: {
          not: StatusEvent.COMPLETED
        }
      }
    });

    const lastPage = Math.ceil(total / limit);
    
    return {
      data: await this.event.findMany({
        where: {
          status: {
            equals: StatusEvent.NOW
          }
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      meta: {
        total,
        page,
        lastPage
      }
    }
  }

  async findAllByUser(id: number) {
    const events = await this.event.findMany({
      where: {
        userId: id
      }
    });

    return events;
  }

  async findByUser(userId: number, eventId: number) {
    const event = await this.event.findFirst({
      where: {
        userId: userId,
        id: eventId
      }
    });

    if (!event) throw new RpcException({
      status: HttpStatus.NOT_FOUND,
      message: `This event with id #${eventId} not found`
    });

    return event;
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
    
    const event = await this.findOne(id);
    
    if ( event.status == StatusEvent.COMPLETED) throw new RpcException({
      status: HttpStatus.CONFLICT,
      message: `The finished event`,
      error: 'conflic_event_ended'
    });

    if ( event.userId != updateEventDto.userId ) throw new RpcException({
      status: HttpStatus.FORBIDDEN,
      message: `This user is not allowed to edit the event`,
      error: 'forbidden_event_edit'
    });

    if ( updateEventDto.start_time ) {
      updateEventDto.status = StatusEvent.PROGRAMMED;
    } else {
      delete updateEventDto.status;
    }

    delete updateEventDto.userId;

    const eventNew = await this.event.update({
      data: updateEventDto,
      where: {
        id
      }
    })
    return eventNew;
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
