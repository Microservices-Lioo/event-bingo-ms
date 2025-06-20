import { forwardRef, Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { CardsModule } from 'src/cards/cards.module';
import { AwardModule } from 'src/award/award.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [forwardRef(() => CardsModule), forwardRef(() => AwardModule), RedisModule],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
  
})
export class EventModule {}
