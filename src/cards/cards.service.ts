
import { HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';

@Injectable()
export class CardsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('Cards-Service');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async create(createCardDto: CreateCardDto) {
    let card_nums: any[];
    let existCard = null;
    let numCard = 0;

    do {
      card_nums = [];
      card_nums = this.generateCard() as Prisma.JsonArray;

      existCard = await this.card.findFirst({
        where: {
          eventId: createCardDto.eventId,
          nums: {
            equals: card_nums
          }
        }
      });

    } while (existCard !== null);

    const numsCards = await this.card.count({
      where: {
        eventId: createCardDto.eventId
      }
    });

    numCard = numsCards + 1;

    return this.card.create({
      data: {
        buyer: createCardDto.buyer,
        eventId: createCardDto.eventId,
        price: createCardDto.price,
        num: 2,
        nums: card_nums,
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

  async update(updateCardDto: UpdateCardDto) {
    const { id, ...data } = updateCardDto;
    await this.findOne(id);

    const event = await this.card.update({
      data: data,
      where: {
        id
      }
    });

    return event;
  }

  // async remove(id: number) {

  //   await this.findOne(id);
    
  //   return await this.cards.update({
  //     where: {
  //       id: id
  //     },
  //     data: {
  //       available: false
  //     }
  //   })

  // }

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
}
