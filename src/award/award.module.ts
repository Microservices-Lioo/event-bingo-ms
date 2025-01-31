import { Module } from '@nestjs/common';
import { AwardService } from './award.service';
import { AwardController } from './award.controller';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [EventModule],
  controllers: [AwardController],
  providers: [AwardService],
})
export class AwardModule {}
