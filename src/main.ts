import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const logger = new Logger('EVENTS-MAIN');

  const appTcp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule, {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: envs.PORT
      }
    }
  );

  const appRedis = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.REDIS,
      options: {
        host: envs.REDIS_HOST,
        port: envs.REDIS_PORT
      }
    }
  )

  appTcp.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  logger.log('MS EVENT running on port ' + envs.PORT );

  await Promise.all([ appTcp.listen(), appRedis.listen()]);

}
bootstrap();
