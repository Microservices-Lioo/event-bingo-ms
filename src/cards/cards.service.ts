
import { forwardRef, HttpStatus, Inject, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateCardDto, UpdateAvailableDto } from './dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { EventService } from 'src/event/event.service';

@Injectable()
export class CardsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('Cards-Service');

  constructor(
    @Inject(forwardRef(() => EventService))
    private readonly eventServ: EventService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async create(createCardDto: CreateCardDto) {
    const { buyer, eventId } = createCardDto;
    let card_nums: any[];
    let existCard = null;
    let numCard = 0;

    const event = await this.eventServ.findOne(eventId);

    if (event.userId == buyer) throw new RpcException({
      status: HttpStatus.FORBIDDEN,
      message: `You cannot participate in your own event.`,
      error: 'forbidden_participate_event'
    });

    do {
      card_nums = [];
      card_nums = this.generateCard() as Prisma.JsonArray;

      existCard = await this.card.findFirst({
        where: {
          eventId: eventId,
          nums: {
            equals: card_nums
          }
        }
      });

    } while (existCard !== null);

    const numsCards = await this.card.count({
      where: {
        eventId: eventId
      }
    });

    numCard = numsCards + 1;

    return this.card.create({
      data: {
        buyer: buyer,
        eventId: eventId,
        num: numCard,
        nums: card_nums
      }
    });
  }

  async findOne(id: number) {
    const card = await this.card.findFirst({
      where: {
        id
      }
    });

    if (!card) throw new RpcException({
      status: HttpStatus.NOT_FOUND,
      message: `Card with id #${id} not found`
    });
    
    return card;
  }

  async findAllCardsByEvent(eventId: number, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const total = await this.card.count({
      where: {
        available: true
      }
    });

    const lastPage = Math.ceil( total / limit );

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

  generateCard() {
    const card = [];
    const col1 = this.generateNumbersColm(1, 15, 5).sort((a, b) => a - b);
    const col2 = this.generateNumbersColm(16, 30, 5).sort((a, b) => a - b);
    const col3 = this.generateNumbersColm(31, 45, 5).sort((a, b) => a - b);
    const col4 = this.generateNumbersColm(46, 60, 5).sort((a, b) => a - b);
    const col5 = this.generateNumbersColm(61, 75, 5).sort((a, b) => a - b);

    col3[2] = 0;

    for(let i = 0; i < 5; i++) {
      card.push([
        { number: col1[i], marked: false },
        { number: col2[i], marked: false },
        { number: col3[i], marked: i === 2 ? true : false },
        { number: col4[i], marked: false },
        { number: col5[i], marked: false }
      ]);

    }
    
    return card;
  }

  generateNumbersColm(min: number, max: number, cant: number) {
    const numbs: number[] = [];

    while (numbs.length < cant) {
      const num = Math.floor(Math.random() * (max - min)) + min;
      if (!numbs.includes(num)) numbs.push(num);
    }
    return numbs;
  }

  async updateAvailable(updateAvailable: UpdateAvailableDto) {
    const { userId, eventId, cardId } = updateAvailable;
    
    const card = await this.findOne(cardId);

    const event = await this.eventServ.findOne(eventId);

    if (event.userId != userId) throw new RpcException({
      status: HttpStatus.FORBIDDEN,
      message: `You cannot disable this card`,
      error: 'forbidden_available_card'
    });

    if (card.buyer == userId) throw new RpcException({
      status: HttpStatus.FORBIDDEN,
      message: `You cannot disable this card`,
      error: 'forbidden_available_card'
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
}
