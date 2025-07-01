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
import { RedisKeys } from 'src/common/consts';

@Injectable()
export class EventService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('Events-Service');
  CACHE_TTL = 30 * 60;

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

    const keyEvent = RedisKeys.EVENT_ID(event.id);
    await this.redisServ.set(keyEvent, event, this.CACHE_TTL);

    return event;
  }

  async findAllStatus(payload: { pagination: PaginationDto, status: StatusEvent }) {
    const { pagination, status } = payload;

    // Claves de caché
    const cacheKeyData = RedisKeys.EVENTS_BY_STATUS(status, pagination.page, pagination.limit);
    const cacheKeyCount = RedisKeys.EVENTS_COUNT_BY_STATUS(status);
    
    try {
      const [cachedData, cachedCount] = await Promise.all([
        this.redisServ.get(cacheKeyData),
        this.redisServ.get(cacheKeyCount)
      ]);

      if (cachedData && cachedCount) {
        const total = parseInt(cachedCount);
        const lastPage = Math.ceil(total / pagination.limit);
        
        return {
          data: JSON.parse(cachedData),
          meta: {
            total,
            page: pagination.page,
            lastPage
          }
        };
      }

      const [data, total] = await Promise.all([
        this.event.findMany({
          where: {
            status: {
              equals: status
            }
          },
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit
        }),
        this.event.count({
          where: {
            status: {
              equals: status
            }
          }
        })
      ]);

      const lastPage = Math.ceil(total / pagination.limit);

      Promise.all([
        this.redisServ.set(cacheKeyData, data, this.CACHE_TTL),
        this.redisServ.set(cacheKeyCount, total, this.CACHE_TTL)
      ]).catch(err => console.log('Cache save error:', err));

      return {
        data,
        meta: {
          total,
          page: pagination.page,
          lastPage
        }
      }
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'findAllStatus',
        message: error.message
      });
    }
  }

  async findAllByUserStatus(payload: { pagination: PaginationDto, status: StatusEvent, userId: number }) {
    const { pagination, status, userId } = payload;

    // Claves de caché
    const cacheKeyData = RedisKeys.EVENTS_BY_USER_BY_STATUS(userId, status, pagination.page, pagination.limit);
    const cacheKeyCount = RedisKeys.EVENTS_COUNT_BY_STATUS(status);
    
    try{ 
      const [cachedData, cachedCount] = await Promise.all([
        this.redisServ.get(cacheKeyData),
        this.redisServ.get(cacheKeyCount)
      ]);

      if (cachedData && cachedCount) {
        const total = parseInt(cachedCount);
        const lastPage = Math.ceil(total / pagination.limit);

        return {
          data: JSON.parse(cachedData).map((event) => {
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

      const [data, total] = await Promise.all([
        this.event.findMany({
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
        }),
        this.event.count({
          where: {
            status: {
              equals: status,        
            }
          },      
        })
      ]);


      const lastPage = Math.ceil(total / pagination.limit);
      Promise.all([
        this.redisServ.set(cacheKeyData, data, this.CACHE_TTL),
        this.redisServ.set(cacheKeyCount, total, this.CACHE_TTL)
      ]).catch(err => console.log('Cache save error:', err));

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
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'findAllByUserStatus',
        message: error.message
      });
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

    const cacheKeyData = RedisKeys.EVENTS_BY_USER(id, page, limit);
    const cacheKeyCount = RedisKeys.EVENTS_COUNT_BY_USER(id);
    try {
      const [cachedData, cachedCount] = await Promise.all([
        this.redisServ.get(cacheKeyData),
        this.redisServ.get(cacheKeyCount)
      ]);

      if (cachedCount && cachedData) {
        const total = parseInt(cachedCount);
        const lastPage = Math.ceil(total / limit);

        return {
          data: JSON.parse(cachedData),
          meta: {
            total,
            page: page,
            lastPage
          }
        };
      }

      
      const [data, total] = await Promise.all([
        this.event.findMany({
          where: {
            userId: id
          },
          skip: (page - 1) * limit,
          take: limit
        }),
        this.event.count({
          where: {
            userId: id
          }
        })
      ]);

      const lastPage = Math.ceil(total / limit);

      Promise.all([
        this.redisServ.set(cacheKeyData, data, this.CACHE_TTL),
        this.redisServ.set(cacheKeyCount, total, this.CACHE_TTL)
      ]).catch(err => console.log('Cache save error:', err));

      return {
        data,
        meta: {
          total,
          page,
          lastPage
        }
      }
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'findAllByUser',
        message: error.message
      });
    }
  }

  async findAllByUserWithAwards(id: number, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const cacheKeyData = RedisKeys.EVENTS_BY_USER_WITH_AWARDS(id, page, limit);
    const cacheKeyCount = RedisKeys.EVENTS_COUNT_BY_USER_WITH_AWARDS(id);
    
    try {
      const [cachedData, cachedCount] = await Promise.all([
        this.redisServ.get(cacheKeyData),
        this.redisServ.get(cacheKeyCount)
      ]);

      if (cachedCount && cachedData) {
        const total = parseInt(cachedCount);
        const lastPage = Math.ceil(total / limit);

        return {
          data: JSON.parse(cachedData),
          meta: {
            total,
            page: page,
            lastPage
          }
        };
      }

      const [data, total] = await Promise.all([
        this.event.findMany({
          where: {
            userId: id
          },
          include: {
            award: true
          },
          skip: (page - 1) * limit,
          take: limit
        }),
        this.event.count({
          where: {
            userId: id
          }
        })
      ]);

      const lastPage = Math.ceil(total / limit);

      Promise.all([
        this.redisServ.set(cacheKeyData, data, this.CACHE_TTL),
        this.redisServ.set(cacheKeyCount, total, this.CACHE_TTL)
      ]).catch(err => console.log('Cache save error:', err));

      return {
        data,
        meta: {
          total,
          page,
          lastPage
        }
      }
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'findAllByUserWithAwards',
        message: error.message
      });
    }
  }

  async findByUser(userId: number, eventId: number) {
    const keyEvent = RedisKeys.EVENT_ID_USER_ID(eventId, userId);
    try {
      const cachedEvent = await this.redisServ.get(keyEvent);

      if (cachedEvent) {
        return JSON.parse(cachedEvent);
      }

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

      await this.redisServ.set(keyEvent, event, this.CACHE_TTL)

      return event;
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'findByUser',
        message: error.message
      });
    }    
  }

  async findOne(id: number) {
    const keyEvent = RedisKeys.EVENT_ID(id);
    
    try {
      const cachedEvent = await this.redisServ.get(keyEvent);

      if (cachedEvent) {
        return JSON.parse(cachedEvent);
      }

      const event = await this.event.findFirst({
        where: {
          id
        }
      });

      if (!event) throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `This event with id #${id} not found`
      });

      await this.redisServ.set(keyEvent, event, this.CACHE_TTL)

      return event;
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'findOne',
        message: error.message
      });
    }
  }

  async findOneWithAward(eventId: number) {
    const cacheKeyData = RedisKeys.EVENT_ID_WITH_AWARDS(eventId);

    try {
      const cachedData = await this.redisServ.get(cacheKeyData);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

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

      await this.redisServ.set(cacheKeyData, event, this.CACHE_TTL)

      return event;
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'findOneWithAward',
        message: error.message
      });
    }
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    const keyEvent = RedisKeys.EVENT_ID(id);

    try{
      const event = await this.findOne(id);

      const keyEventUser =  RedisKeys.EVENT_ID_USER_ID_WITH_AWARDS(id, event.userId);

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

      const eventAward = await this.event.update({
        data: updateEventDto,
        where: {
          id
        },
        include: {
          award: true
        }
      });

      const { award, ...eventUpdate } = eventAward;

      // Actualizar evento en redis
      await this.redisServ.set(keyEvent, eventUpdate, this.CACHE_TTL);
      await this.redisServ.set(keyEventUser, eventAward, this.CACHE_TTL);
      
      this.invalidateCachedEvent();

      return eventUpdate;
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'update',
        message: error.message
      });
    }
  }

  async updateStatus(updateStatusEvent: UpdateStatusEventDto) {
    const { status, userId, eventId } = updateStatusEvent;

    const keyEvent = RedisKeys.EVENT_ID(eventId);
    const keyEventUser = RedisKeys.EVENT_ID_USER_ID_WITH_AWARDS(eventId, userId);

    try{
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

      const eventAward = await this.event.update({
        data: {
          status: status,
          start_time: status === StatusEvent.NOW ? now : undefined
        },
        where: {
          id: eventId
        },
        include: {
          award: true
        }
      });

      const { award, ...eventUpdate } = eventAward;

      // Actualizar evento en redis
      await this.redisServ.set(keyEvent, eventUpdate, this.CACHE_TTL);
      await this.redisServ.set(keyEventUser, eventAward, this.CACHE_TTL);

      this.invalidateCachedEvent();

      if (status == StatusEvent.COMPLETED) {
        return { status: StatusEvent.COMPLETED, message: 'Finished event' }
      } else if (status == StatusEvent.NOW) {
        return { status: StatusEvent.NOW, message: 'Started event' }
      } else {
        return { status: StatusEvent.TODAY, message: 'Event is today' }
      }
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'updateStatus',
        message: error.message
      });
    }
  }

  async remove(deletDto: DeleteEventDto) {
    const { id, userId } = deletDto;
    const keyEvent = RedisKeys.EVENT_ID(id);
    const keyEventUser = RedisKeys.EVENT_ID_USER_ID(id, userId);
    
    try{
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

      const cachedEvent = await this.redisServ.get(keyEvent);
      const cachedEventUser = await this.redisServ.get(keyEventUser);

      if(cachedEvent && cachedEventUser) {
        await this.redisServ.delete(keyEvent);
        await this.redisServ.delete(keyEventUser);
      }

      this.invalidateCachedEvent();

      return event;
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'remove',
        message: error.message
      });
    }
  }

  async findByUserEvent(eventId: number, userId: number) {
    const key = RedisKeys.EVENT_ID_USER_ID_WITH_AWARDS(eventId, userId);

    try{
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

      await this.redisServ.set(key, event, this.CACHE_TTL)

      return event;
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'FindByUserEvent',
        message: error.message
      });
    }
  }

  async findByUserRoleEvent(eventId: number, userId: number ) {
    const cacheKeyEvent = RedisKeys.EVENT_ID_USER_ID(eventId, userId);

    try{
      const cachedData = await this.redisServ.get(cacheKeyEvent);

      if (cachedData) {
        return true;
      }

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
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'findByUserRoleEvent',
        message: error.message
      });
    }
  }

  async invalidateCachedEvent() {
    const cacheKey = RedisKeys.EVENTS_STATUS_PATTERN;
    this.redisServ.delete(cacheKey);
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
    const key = RedisKeys.EVENT_ID(id);

    try {
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

      await this.redisServ.set(key, event, this.CACHE_TTL);

      return event;
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'findOnWs',
        message: error.message
      });
    }
  }

  // Redis
  async joinRoom(key: string, data: { userId: number, socketId: string }) {
    try {  
      await this.redisServ.hset(key, data);
      return true;
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'joinRoom',
        message: error.message
      });
    }
  }
  
  async countUsersRoom(key: string) {
    try { 
      return await this.redisServ.hlen(key);
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'countUsersRoom',
        message: error.message
      });
    }
  }
  
  async deleteRoom(key: string) {
    try { 
      return await this.redisServ.delete(key);
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'deleteRoom',
        message: error.message
      });
    }
  }

  async deleteUserRoom(
    payload: {userId: number, socketId: string}
  ): Promise<string | null> {
    try { 
      return await this.redisServ.deleteUserRoom(payload);
    } catch(error){
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        name: 'deleteUserRoom',
        message: error.message
      });
    }
  }
}
