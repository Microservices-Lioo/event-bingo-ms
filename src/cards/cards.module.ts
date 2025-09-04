import { Module, forwardRef } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { EventModule } from 'src/event/event.module';
import { NatsModule } from 'src/transport/nats.module';

@Module({
  imports: [forwardRef(() =>EventModule), NatsModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService]
})
export class CardsModule {}
