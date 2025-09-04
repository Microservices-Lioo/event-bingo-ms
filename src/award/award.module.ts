import { forwardRef, Module } from '@nestjs/common';
import { AwardService } from './award.service';
import { AwardController } from './award.controller';
import { EventModule } from 'src/event/event.module';
import { NatsModule } from 'src/transport/nats.module';

@Module({
  imports: [forwardRef(() => EventModule), NatsModule],
  controllers: [AwardController],
  providers: [AwardService],
  exports: [AwardService]
})
export class AwardModule {}
