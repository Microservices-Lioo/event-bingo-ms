import { forwardRef, Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { CardsModule } from 'src/cards/cards.module';
import { AwardModule } from 'src/award/award.module';

@Module({
  imports: [forwardRef(() => CardsModule), forwardRef(() => AwardModule)],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
  
})
export class EventModule {}
