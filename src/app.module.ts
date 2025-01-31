import { Module } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { CardsModule } from './cards/cards.module';
import { AwardModule } from './award/award.module';

@Module({
  imports: [EventModule, CardsModule, AwardModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
