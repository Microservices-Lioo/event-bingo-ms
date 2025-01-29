import { forwardRef, Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { CardsModule } from 'src/cards/cards.module';

@Module({
  imports: [forwardRef(() => CardsModule)],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService]
})
export class EventModule {}
