import { 
  forwardRef, 
  HttpStatus, 
  Inject, 
  Injectable, 
  Logger, 
  OnModuleInit 
} from '@nestjs/common';
import { 
  CreateEventDto, 
  UpdateEventDto, 
  DeleteEventDto, 
  UpdateStatusEventDto 
} from './common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { StatusEvent } from './common';
import { PaginationDto } from 'src/common';
import { CardsService } from 'src/cards/cards.service';
import { AwardService } from 'src/award/award.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class EventService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('Events-Service');

  async onModuleInit() {
    await this.$connect();
  }

  constructor(
    @Inject(forwardRef(() => CardsService))
    private readonly servCard: CardsService,
    @Inject(forwardRef(() => AwardService))
    private readonly servAward: AwardService,
    private readonly redisServ: RedisService
  ) {
    super();
  }

  async create(createEventDto: CreateEventDto) {
    const event = await this.event.create({
      data: createEventDto
    });

    return event;
  }

  async findAllStatus(payload: { pagination: PaginationDto, status: StatusEvent }) {
    const { pagination, status } = payload;

    const total = await this.event.count({
      where: {
        status: {
          equals: status
        }
      }
    });

    const lastPage = Math.ceil(total / pagination.limit);

    return {
      data: await this.event.findMany({
        where: {
          status: {
            equals: status
          }
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit
      }),
      meta: {
        total,
        page: pagination.page,
        lastPage
      }
    }
  }

  async findAllByUserStatus(payload: { pagination: PaginationDto, status: StatusEvent, userId: number }) {
    const { pagination, status, userId } = payload;

    const total = await this.event.count({
      where: {
        status: {
          equals: status,        
        }
      },      
    });

    const lastPage = Math.ceil(total / pagination.limit);
    const data = await this.event.findMany({
      relationLoadStrategy: 'join',
      include: {
        card: {
          select: {
            buyer: true
          }
        }
      },
      where: {
        status: {
          equals: status
        },
      },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit
    });


    return {
      data: data.map((event) => {
        const isBuyer = event.card.find((card) => card.buyer === userId)
        const { card, ...eventData } = event;
        if (isBuyer) {
          return {
            ...eventData,
            buyer: true
          }
        } else {
          return {
            ...eventData,
            buyer: false
          }
        }
      }),
      meta: {
        total,
        page: pagination.page,
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
            not: StatusEvent.COMPLETED
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

  async findAllByUser(id: number, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const total = await this.event.count({
      where: {
        userId: id
      }
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data: await this.event.findMany({
        where: {
          userId: id
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

  async findAllByUserWithAwards(id: number, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const total = await this.event.count({
      where: {
        userId: id
      }
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data: await this.event.findMany({
        where: {
          userId: id
        },
        include: {
          award: true
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

  async findOneWithAward(eventId: number) {
    const event = await this.event.findFirst({
      include: {
        award: true
      },
      where: {
        id: eventId
      }
    });

    if (!event) throw new RpcException({
      status: HttpStatus.NOT_FOUND,
      message: `This event with id #${eventId} not found`
    });

    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {

    const event = await this.findOne(id);

    if (event.status == StatusEvent.COMPLETED) throw new RpcException({
      status: HttpStatus.CONFLICT,
      message: `The finished event`,
      error: 'conflict_endend_event'
    });

    if (event.userId != updateEventDto.userId) throw new RpcException({
      status: HttpStatus.FORBIDDEN,
      message: `This user is not allowed to edit the event`,
      error: 'forbidden_edit_event'
    });

    if (updateEventDto.status) {
      updateEventDto.status = StatusEvent.PROGRAMMED;
    } else {
      delete updateEventDto.status;
    }

    delete updateEventDto.userId;

    if (updateEventDto.price && updateEventDto.price <= 0) throw new RpcException({
      status: HttpStatus.CONFLICT,
      message: `Price cannot be less or equal than zero`,
      error: 'conflict_price_event'
    });

    const eventNew = await this.event.update({
      data: updateEventDto,
      where: {
        id
      }
    })
    return eventNew;
  }

  async updateStatus(updateStatusEvent: UpdateStatusEventDto) {
    const { status, userId, eventId } = updateStatusEvent;

    if (status == StatusEvent.PROGRAMMED) throw new RpcException({
      status: HttpStatus.FORBIDDEN,
      message: `Event cannot be PROGRAMMED`,
      error: 'forbidden_status_event'
    });

    const event = await this.findOne(eventId);

    if (event.userId != userId) throw new RpcException({
      status: HttpStatus.FORBIDDEN,
      message: `This user is not allowed to edit the event`,
      error: 'forbidden_edit_event'
    });

    const now = new Date();
    const eventDate = event.time;
    
    if (status == StatusEvent.TODAY) {      
      if (
        eventDate.getUTCDate() != now.getUTCDate()
        || eventDate.getUTCFullYear() != now.getUTCFullYear()
        || eventDate.getUTCMonth() != now.getUTCMonth()
      ) {
        throw new RpcException({
          status: HttpStatus.FORBIDDEN,
          message: `Event is not TODAY`,
          error: 'forbidden_status_event'
        });
      }
    }

    if (status == StatusEvent.NOW) {
      if (
        eventDate.toISOString() > now.toISOString()
        || event.status != StatusEvent.TODAY
      ) {
        throw new RpcException({
          status: HttpStatus.FORBIDDEN,
          message: `Event is not NOW`,
          error: 'forbidden_status_event'
        });
      }
    }
    
    if (status == StatusEvent.COMPLETED) {
      if (
        eventDate >= now 
        || event.status != StatusEvent.NOW
      ) {
        throw new RpcException({
          status: HttpStatus.FORBIDDEN,
          message: `Event is not started`,
          error: 'forbidden_status_event'
        });
      }
    }

    await this.event.update({
      data: {
        status: status,
        start_time: status === StatusEvent.NOW ? now : undefined
      },
      where: {
        id: eventId
      }
    });

    if (status == StatusEvent.COMPLETED) {
      return { status: StatusEvent.COMPLETED, message: 'Finished event' }
    } else if (status == StatusEvent.NOW) {
      return { status: StatusEvent.NOW, message: 'Started event' }
    } else {
      return { status: StatusEvent.TODAY, message: 'Event is today' }
    }

  }

  async remove(deletDto: DeleteEventDto) {
    const { id, userId } = deletDto;
    const event = await this.findOne(id);

    if (event.userId != userId) {
      throw new RpcException({
        status: HttpStatus.FORBIDDEN,
        message: `You are not allowed to delete this event`,
        error: 'forbidden_event_delete'
      })
    }

    if (event.status == StatusEvent.COMPLETED) {
      throw new RpcException({
        status: HttpStatus.FORBIDDEN,
        message: `The finished event`,
        error: 'forbidden_event_ended'
      })
    }

    const cards = await this.servCard.findAllCardsByEvent(id, { limit: 10, page: 1 });

    if (cards.data.length > 0) throw new RpcException({
      status: HttpStatus.CONFLICT,
      message: `This event has cards sold.`,
      error: 'conflict_event_cards_sold'
    });

    await this.servAward.removeByEventId(event.id);

    await this.event.delete({
      where: { id: id },
    });

    return event;
  }

  async findByUserEvent(eventId: number, userId: number) {
    const key = `event:${eventId}:${userId}`;

    const cachedEvent = await this.redisServ.get(key);

    if (cachedEvent) {
      return JSON.parse(cachedEvent);
    }

    const event = await this.event.findFirst({
      where: {
        id: eventId,
        userId: userId
      },
      include: {
        award: true
      }
    });

    if (!event) throw new RpcException({
      status: HttpStatus.NOT_FOUND,
      message: `This event with user no found`,
      error: 'findByUserEvent'
    });

    await this.redisServ.set(key, JSON.stringify(event), 1800)

    return event;
  }

  async findByUserRoleEvent(eventId: number, userId: number ) {
    const event = await this.event.findFirst({
      where: {
        id: eventId,
        userId: userId
      }
    });

    if (!event) {
      return false;
    }

    return true;
  }

  // WebSocket
  async verifyAParticipatingUserEvent(payload: { eventId: number, userId: number }) {
    const { eventId, userId } = payload;
    const event = await this.findOneWs(eventId);

    if (event && event.userId == userId) {
      return true;
    } else {
      return await this.servCard.buyerEventExists(eventId, userId);
    }
  }

  async findOneWs(id: number) {
    const key = `event:${id}`;

    const cachedEvent = await this.redisServ.get(key);

    if (cachedEvent) {
      return JSON.parse(cachedEvent);
    }

    const event = await this.event.findFirst({
      where: {
        id
      }
    });

    if (!event) {
      return null;
    };

    await this.redisServ.set(key, JSON.stringify(event), 1800);

    return event;
  }

  // Redis
  async joinRoom(key: string, data: { userId: number, socketId: string }) {
    await this.redisServ.hset(key, data)
  }
  
  async countUsersRoom(key: string) {
    return await this.redisServ.hlen(key);
  }

  async moveToRoom(keyOrigin: string, keyDestination: string) {
    return await this.redisServ.moveRoom(keyOrigin, keyDestination);
  }
  
  async deleteRoom(key: string) {
    return await this.redisServ.delete(key);
  }
}
