import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({
    trustProxy: true,
  }),
  {
    bufferLogs: true,
  },
);

const config = app.get(ConfigService);
const logger = app.get(Logger);

SwaggerModule.setup('swagger', app, () => {
  return SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(config.get('APP_NAME'))
      .setVersion(config.get('APP_VERSION'))
      .build(),
  );
});

app.useLogger(logger);

app.enableShutdownHooks(['SIGINT', 'SIGTERM']);

app.setGlobalPrefix('api', {
  exclude: ['startupz', 'livez', 'readyz'],
});

app.enableVersioning({
  type: VersioningType.URI,
});

await app.listen(config.get('PORT'), '0.0.0.0');

const url = await app.getUrl();

logger.log(`Listening at ${url}`);
