import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggerModule } from 'nestjs-pino';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { AuthModule } from './modules/auth/auth.module';
import { HealthcheckModule } from './modules/healthcheck/healthcheck.module';
import { HttpExceptionFilter } from './modules/shared/http/filters/http-exception.filter';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get('LOG_LEVEL'),
          transport:
            config.get('NODE_ENV') === 'development'
              ? {
                  target: 'pino-pretty',
                }
              : undefined,
        },
      }),
      imports: [ConfigModule],
    }),
    PrometheusModule.register(),
    AuthModule,
    HealthcheckModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
