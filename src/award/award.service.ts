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

  //* crear uno o mas premios
  async create(createAwardDto: CreateAwardDto[]) {
    return await this.award.createMany({
      data: createAwardDto
    });

  }

  //* Obtener todos los premios por evento
  async findAllByEvent(eventId: string) {
    const awards = await this.award.findMany({
      where: {
        eventId
      },
      include: { card: true }
    });
    
    const result = awards.map(({ card, ...award}) => ({ ...award, winner: award.winner ? card.buyer : award.winner }))
    return result;
  }

  //* Obtener todos los ids de losganadores de un evento por premio
  async findAllWinnersByEvent(eventId: string) {
    return await this.award.findMany({
      where: {
        eventId,
        winner: {
          not: null
        }
      },
    });
  }

  //* Obtener una premios
  async findOne(id: string) {
    const award = await this.award.findFirst({
      where: {
        id
      }
    });

    if (!award) throw new RpcException({
      status: HttpStatus.NOT_FOUND,
      message: `El premio con el id #${id} no encontrada`,
      code: 'AWARD_NOT_FOUND'
    });

    return award;
  }

  //* Actualizar un premio
  async update(updateAwardDto: UpdateAwardDto) {
    const { id, ...data } = updateAwardDto;

    await this.findOne(id);

    return await this.award.update({
      data: data,
      where: {
        id
      }
    });
  }

  //* Eliminar un premio
  async remove(id: string) {
    
    const award = await this.findOne(id);
    const { winner, gameId } = award;

    if (gameId || winner ) throw new RpcException({
      status: HttpStatus.CONFLICT,
      message: `El premio ya ha sido asignado, no es posible eliminarlo`,
      code: 'AWARD_CONFLICT'
    });
    
    await this.award.delete({
      where: {
        id
      }
    });

    return id;
  }

  //* Eliminar todos los premios de un evento
  async removeByEventId(id: string) {
    return await this.award.deleteMany({
      where: {
        eventId: id
      }
    });
  }
}
