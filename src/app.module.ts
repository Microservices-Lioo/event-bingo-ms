import { Module } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { CardsModule } from './cards/cards.module';

@Module({
  imports: [EventModule, CardsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
