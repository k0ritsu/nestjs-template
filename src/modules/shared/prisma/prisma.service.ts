import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '../../../config/config.service';
import { PrismaClient } from '../../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.get('DATABASE_URL'),
      }),
      log:
        config.get('NODE_ENV') === 'development'
          ? [
              {
                emit: 'event',
                level: 'query',
              },
            ]
          : undefined,
    });
  }

  onApplicationBootstrap(): Promise<void> {
    // TODO: Fix PrismaClient generic type
    (this as PrismaClient<'query'>).$on(
      'query',
      this.logger.debug.bind(this.logger),
    );

    return this.$connect();
  }

  onApplicationShutdown(): Promise<void> {
    return this.$disconnect();
  }
}
