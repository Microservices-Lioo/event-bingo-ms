import { forwardRef, Module } from '@nestjs/common';
import { AwardService } from './award.service';
import { AwardController } from './award.controller';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [forwardRef(() => EventModule)],
  controllers: [AwardController],
  providers: [AwardService],
  exports: [AwardService]
})
export class AwardModule {}
