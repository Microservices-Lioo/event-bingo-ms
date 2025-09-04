import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllRpcExceptionsFilter } from './common';

async function bootstrap() {

  const logger = new Logger('EVENTS-MAIN');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule, {
      transport: Transport.NATS,
      options: {
        servers: envs.NATS_SERVERS
      }
    }
  );

  app.useGlobalFilters(new AllRpcExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  logger.log('MS EVENT running on port ' + envs.PORT );

  await Promise.all([ app.listen()]);

}
bootstrap();
