import { Module } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { CardsModule } from './cards/cards.module';
import { AwardModule } from './award/award.module';
import { NatsModule } from './transport/nats.module';

@Module({
  imports: [EventModule, CardsModule, AwardModule, NatsModule],
  controllers: [],
})
export class AppModule {}
