import { Module, forwardRef } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { EventModule } from 'src/event/event.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [forwardRef(() =>EventModule), RedisModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService]
})
export class CardsModule {}
