
import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit
} from '@nestjs/common';
import { CheckOrUncheckDto, CreateCardDto, UpdateAvailableDto, UpdateAvailableManyDto } from './dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { EventService } from 'src/event/event.service';
import { ParamIdBuyerEventDto } from 'src/event/common/dto';

const BINGO_RANGES = {
  B: { min: 1, max: 15 },
  I: { min: 16, max: 30 },
  N: { min: 31, max: 45 },
  G: { min: 46, max: 60 },
  O: { min: 61, max: 75 }
};

@Injectable()
export class CardsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('Cards-Service');

  constructor(
    @Inject(forwardRef(() => EventService))
    private readonly eventServ: EventService,
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  //* Crear card
  async create(createCardDto: CreateCardDto) {
    const { buyer, eventId, quantity } = createCardDto;
    let cards = [];

    const event = await this.eventServ.findOne(eventId);

    if (event.userId == buyer) throw new RpcException({
      status: HttpStatus.FORBIDDEN,
      message: `El propietario no puede jugar en su propio evento.`,
      code: 'CARD_FORBIDDEN'
    });

    for (let i = 0; i < quantity; i++) {
      let existCard = null;
      do {
        let B = [...this.generarCol(BINGO_RANGES.B)].sort((a, b) => a - b);
        let I = [...this.generarCol(BINGO_RANGES.I)].sort((a, b) => a - b);
        let N = [...this.generarCol(BINGO_RANGES.N)].sort((a, b) => a - b);
        let G = [...this.generarCol(BINGO_RANGES.G)].sort((a, b) => a - b);
        let O = [...this.generarCol(BINGO_RANGES.O)].sort((a, b) => a - b);

        const colB = B.map(num => ({ marked: false, num: num }));
        const colI = I.map(num => ({ marked: false, num: num }));
        const colN = N.map(num => ({ marked: false, num: num }));
        const colG = G.map(num => ({ marked: false, num: num }));
        const colO = O.map(num => ({ marked: false, num: num }));

        let card_nums = [[...colB], [...colI], [...colN], [...colG], [...colO]] as Prisma.JsonArray;

        existCard = await this.card.findFirst({
          where: {
            eventId: eventId,
            nums: {
              equals: card_nums
            }
          }
        });

        if (!existCard) {
          const card = await this.card.create({
            data: {
              buyer: buyer,
              eventId: eventId,
              nums: card_nums,
              available: false
            },
            select: {
              id: true,
              buyer: true,
              eventId: true,
              nums: true,
              available: true
            }
          });

          cards.push(card);
        }
      } while (existCard !== null);
    }

    if (cards.length <= 0) {
      throw new RpcException({
        message: `Las tablas no se han creado`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'CARD_INTERNAL_ERROR'
      });
    }
    return { price: event.price, cards, eventName: event.name };
  }

  //* Obtener una card
  async findOne(id: string) {
    const card = await this.card.findFirst({
      where: {
        id
      }
    });

    if (!card) throw new RpcException({
      status: HttpStatus.NOT_FOUND,
      message: `La tabla con id #${id} no encontrada`,
      code: 'CARD_NOT_FOUND'
    });

    return card;
  }

  async findAllIds(ids: string[]) {
    const cards = await this.card.findMany({
      where: {
        id: {
          in: ids
        }
      },
      select: {
        id: true,
        buyer: true
      }
    });
    return cards;
  }

  //* Obtener una card por su id que pertenesca a un usuario y un evento
  async findOneByIdBuyerEvent(payloadDto: ParamIdBuyerEventDto) {
    const { id, buyer, eventId } = payloadDto;

    const card = await this.card.findFirst({
      where: {
        id, buyer, eventId, available: true
      }
    });

    if (!card) throw new RpcException({
      status: HttpStatus.NOT_FOUND,
      message: `Tabla no encontrada`,
      code: 'CARD_NOT_FOUND'
    });

    const { nums } = card;
    return nums;
  }

  //* Obtener todas las cards por evento
  async findAllByEvent(eventId: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const total = await this.card.count({
      where: {
        eventId: eventId,
        available: true
      }
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data: await this.card.findMany({
        where: {
          eventId: eventId,
          available: true
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

  //* Obtener la cantidad de cards por evento
  async countAllCardsByEvent(eventiId: string) {
    const total = await this.card.count({
      where: {
        eventId: eventiId
      }
    });

    const totalDisabled = await this.card.count({
      where: {
        eventId: eventiId,
        available: false
      }
    });
    return { total, disabled: totalDisabled };
  }

  //* Actualizar la disponibilidad de una card
  async updateAvailable(updateAvailable: UpdateAvailableDto) {
    const { userId, eventId, cardId } = updateAvailable;

    const card = await this.findOne(cardId);

    const event = await this.eventServ.findOne(eventId);

    if (event.userId != userId) throw new RpcException({
      status: HttpStatus.FORBIDDEN,
      message: `No puedes actualizar la card`,
      code: 'CARD_FORBIDDEN'
    });

    if (card.buyer == userId) throw new RpcException({
      status: HttpStatus.FORBIDDEN,
      message: `No puedes actualizar la card`,
      code: 'CARD_FORBIDDEN'
    });

    await this.card.update({
      data: {
        available: false
      },
      where: {
        id: cardId
      }
    })
    return true;
  }

  //* Actualizar la disponibilidad de muchas cards
  async updateAvailableMany(updateAvailable: UpdateAvailableManyDto) {
    const { ids } = updateAvailable;

    await this.card.updateMany({
      data: { available: true },
      where: { id: { in: ids } }
    })
  }

  //* Obtener el total de cards de un comprador por evento
  async getCardCountForUserAndEvent(card: { buyer: string, eventId: string }) {
    const { buyer, eventId } = card;
    const total = await this.card.count({
      where: {
        buyer, eventId, available: true
      }
    });

    return total;
  }

  //* Obtener todas las cards de un comprador por evento
  async findToEventByBuyer(buyer: string, eventId: string) {
    const cards = await this.card.findMany({
      where: {
        buyer,
        eventId,
        available: true,
      }
    });

    return cards;
  }

  //* Verificar el comprador de una card
  async buyerEventExists(eventId: string, buyer: string): Promise<boolean> {

    const card = await this.card.findFirst({
      where: {
        buyer,
        eventId
      }
    });

    if (!card) {
      return false;
    }

    return true;
  }

  //* Cambiar el estado de una celda de una card
  async checkOrUncheckBox(checkOrUncheckDto: CheckOrUncheckDto) {
    const { cardId, markedNum, userId: buyer } = checkOrUncheckDto;

    const card = await this.findOne(cardId);

    if (card.buyer !== buyer) throw new RpcException({
      status: HttpStatus.FORBIDDEN,
      message: `No tiene permitido modificar esta card`,
      code: 'CARD_FORBIDDEN'
    });

    const nums = card.nums as any[][];

    const newNums = nums.map(cell => {
      const newCell = cell.map(pos => pos.num === markedNum ? { ...pos, marked: !pos.marked } : pos);
      return newCell;
    });

    return await this.card.update({
      data: {
        nums: newNums as Prisma.JsonArray
      },
      where: {
        id: cardId
      }
    });
  }

  //* Validar una card
  async validateCards(ids: string[]) {
    ids = Array.from(new Set(ids));

    const cards = await this.card.findMany({
      where: {
        id: {
          in: ids
        }
      },
      include: { event: { select: { price: true } } }
    });

    if (cards.length !== ids.length) {
      throw new RpcException({
        message: `Las cards no se encontraron`,
        status: HttpStatus.BAD_REQUEST,
        code: 'CARD_BAD_REQUEST'
      });
    }

    return cards;
  }

  //* Generar los numeros de las columnas para las cards
  generarCol(data: { max: number, min: number }) {
    const { max, min } = data;
    const col = new Set<number>();
    let i = 0;
    do {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!col.has(num)) {
        col.add(num);
        i++;
      }
    } while (i < 5);
    return col;
  }

  //* Eliminar las cards por ID
  async removeCards(ids: string[]) {
    return await this.card.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
  }

  //* Resetear el check de las cards de un evento
  async resetCardsForEvent(eventId: string, ids: string[]) {
    const cards = await this.card.findMany({
      where: { eventId, id: { in: ids } },
      select: { id: true, nums: true }
    });

    const updates = cards.map(card => {
      const resetNums = (card.nums as any).map((row: any[]) =>
        row.map((cell: any) => ({ ...cell, marked: false }))
      );

      return this.card.update({
        where: { id: card.id },
        data: { nums: resetNums }
      });
    });

    const result = await this.$transaction(updates);

    return result;
  }
}
