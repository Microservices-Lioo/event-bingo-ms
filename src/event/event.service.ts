import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit
} from '@nestjs/common';

import { PrismaClient, StatusEvent } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { CardsService } from 'src/cards/cards.service';
import { AwardService } from 'src/award/award.service';
import { CreateAwardDto } from 'src/award/dto';
import { CreateEventDto, UpdateEventDto, UpdateStatusEventDto, DeleteEventDto, PaginationStatusDto, ParamIdEventUserDto } from './common/dto';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';

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
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {
    super();
  }

  //* Crear un evento
  async create(createEventDto: CreateEventDto, createAwardDto: CreateAwardDto[]) {
    const compensations = [];
    try {
      // Creación del evento
      const event = await this.event.create({
        data: createEventDto
      });
      compensations.push(() => this.remove({id: event.id, userId: event.userId }));

      // Creación de los premios
      const awardItems = createAwardDto.map(award => ({eventId: event.id, ...award}))
      const awards = await this.servAward.create(awardItems);
      compensations.push(() => this.servAward.removeByEventId(event.id));

      // Crear sala y asignar rol
      const room = await firstValueFrom(
        this.client.send('createRoom', { 
          eventId: event.id, 
          userId: createEventDto.userId,
          start_time: createEventDto.start_time
        })
      );

      return { event, awards, ...room };
    } catch(error) {
      for (let compensation of compensations.reverse()) {
        try {
          await compensation();
        } catch (compError) {
          this.logger.error('Error en compensación:', compError);          
        }
      }

      this.logger.error('Error en compensación:', error);          
      throw new RpcException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al crear el evento. Operación revertida.'
      })
    }
  }

  //* Obtener todos los eventos por status
  async findAllStatus(payload: PaginationStatusDto) {
    const { pagination, status } = payload;

    const [data, total] = await Promise.all([
      this.event.findMany({
        where: {
          status: status
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit
      }),
      this.event.count({
        where: {
          status: status
        }
      })
    ]);

    const lastPage = Math.ceil(total / pagination.limit);

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        lastPage
      }
    }
  }

  //* Obtener todos los eventos de un usuario
  async findAllUser(data: { userId: string, pagination: PaginationDto}) {
    const { userId, pagination } = data;
    const { page, limit } = pagination;

    const [events, total] = await Promise.all([
      this.event.findMany({
        where: {userId},
        skip: (page - 1) * limit,
        take: limit
      }),
      this.event.count({
        where: {
          userId
        }
      })
    ]);

    const lastPage = Math.ceil(total / limit);
    return {
      data: events,
      meta: {
        total,
        page,
        lastPage
      }
    }
  }

  //* Obtener todos los eventos de un usuario por status
  async findAllUserByStatus(payload: { pagination: PaginationDto, status: StatusEvent, userId: string }) {
    const { pagination, status, userId } = payload;

    const [data, total] = await Promise.all([
      this.event.findMany({
        where: {
          status: status,
          userId: userId
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit
      }),
      this.event.count({
        where: {
          status: status,
          userId: userId
        },
      })
    ]);

    const lastPage = Math.ceil(total / pagination.limit);

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        lastPage
      }
    }

  }

  //* Obtener todos los eventos
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const total = await this.event.count();

    const lastPage = Math.ceil(total / limit);

    return {
      data: await this.event.findMany({
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

  //* Obtener todos los eventos de un usuario con sus premios
  async findAllUserWithAwards(id: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

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

    return {
      data,
      meta: {
        total,
        page,
        lastPage
      }
    }
  }

  //* Obtener un evento de un usuario
  async findUser(userId: string, eventId: string) {
    const event = await this.event.findFirst({
      where: {
        userId: userId,
        id: eventId
      }
    });

    if (!event) throw new RpcException({
      status: HttpStatus.NOT_FOUND,
      message: `El evento con id #${eventId} no encontrado`,
      code: 'EVENT_NOT_FOUND'
    });

    return event;
  }

  //* Obtener un evento por id
  async findOne(id: string) {
    const event = await this.event.findFirst({
      where: {
        id
      }
    });

    if (!event) throw new RpcException({
      status: HttpStatus.NOT_FOUND,
      message: `El evento con id #${id} no encontrado`,
      code: 'EVENT_NOT_FOUND'
    });

    return event;
  }

  //* Obtener un evento con sus premios
  async findOneWithAwards(eventId: string) {
    const event = await this.event.findFirst({
      include: {
        award: { include: { card: true }}
      },
      where: {
        id: eventId
      }
    });

    if (!event) throw new RpcException({
      status: HttpStatus.NOT_FOUND,
      message: `El evento con id #${eventId} no encontrado`,
      code: 'EVENT_NOT_FOUND'
    });
    const { award, ...data } = event;
    const result = award.map(({ card, ...award}) => ({ ...award, winner: award.winner ? card.buyer : award.winner }))

    return { ...data, award: result };
  }

  //* Actualizar un evento
  async update(updateEventDto: UpdateEventDto) {
    const { id, userId, ...data} = updateEventDto;

    const event = await this.findOne(id);

    // verifica que el evento aun no se ha completado o activado
    if (event.status !== StatusEvent.PENDING) throw new RpcException({
      status: HttpStatus.CONFLICT,
      message: `Ya no es posible editar este evento`,
      code: 'EVENT_CONFLICT'
    });

    // verifica que el usuario que hace la peticion no es le dueño
    if (event.userId !== userId) throw new RpcException({
      status: HttpStatus.FORBIDDEN,
      message: `No tienes acceso a este recurso`,
      code: 'EVENT_FORBIDDEN'
    });

    // verifica que el precio sea positvo
    if (updateEventDto.price && updateEventDto.price <= 0) throw new RpcException({
      status: HttpStatus.BAD_REQUEST,
      message: `El precio debe ser un número positivo`,
      code: 'EVENT_BAD_REQUEST'
    });

    return await this.event.update({
      data: data,
      where: {
        id
      }
    });
  }

  //* Actualizar el estado del evento
  async updateStatus(updateStatusEvent: UpdateStatusEventDto) {
    const { id, userId, status } = updateStatusEvent;

    const event = await this.findOne(id);

    // verifica que el usuario que hace la peticion no es le dueño
    if (event.userId !== userId) throw new RpcException({
      status: HttpStatus.FORBIDDEN,
      message: `No tienes acceso a este recurso`,
      code: 'EVENT_FORBIDDEN'
    });

    // verificar status que no haya terminado
    if (event.status === StatusEvent.COMPLETED) {
      throw new RpcException({
        status: HttpStatus.CONFLICT,
        message: `Este evento ya ha terminado`,
        code: 'EVENT_CONFLICT'
      });
    }

    const eventUpdate = await this.event.update({
      data: {
        status: status
      },
      where: {
        id: id
      }
    });

    return eventUpdate;
  }

  //* Eliminar un evento
  async remove(deletDto: DeleteEventDto) {
    const { id, userId } = deletDto;

    const event = await this.findOne(id);

    // no se elimina el evento que ya finalizó
    if (event.status !== StatusEvent.PENDING) {
      throw new RpcException({
        status: HttpStatus.CONFLICT,
        message: `Ya no es posible eliminar este evento`,
        code: 'EVENT_CONFLICT'
      })
    }

    // evento con tablas ya compradas
    const cards = await this.servCard.findAllByEvent(id, { page: 1, limit: 1});

    if (cards.data.length > 0) throw new RpcException({
      status: HttpStatus.CONFLICT,
      message: `El evento cuenta ya cuenta con jugadores`,
      code: 'EVENT_CONFLICT'
    });

    // eliminar los premios
    await this.servAward.removeByEventId(id);

    // eliminar el evento
    await this.event.delete({
      where: { id: id },
    });

    return event;
  }

  //* Obtener un evento de un usuario por id
  async findOneByUser(payload: ParamIdEventUserDto) {
    const { id, userId } = payload;
    const event = await this.event.findFirst({
      where: {
        id,
        userId: userId
      }
    });

    if (!event) throw new RpcException({
      status: HttpStatus.NOT_FOUND,
      message: `El usuario no tiene ningun evento`,
      code: 'EVENT_NOT_FOUND'
    });

    return event;
  }

  //* Finalizar evento
  async eventCompleted(updateEventDto: UpdateEventDto) {
    const { id, userId, ...data} = updateEventDto;

    const event = await this.findOne(id);

    // verifica que el usuario que hace la peticion no es le dueño
    if (event.userId !== userId) throw new RpcException({
      status: HttpStatus.FORBIDDEN,
      message: `No tienes acceso a este recurso`,
      code: 'EVENT_FORBIDDEN'
    });

    return await this.event.update({
      data: data,
      where: {
        id
      }
    });
  }
}
