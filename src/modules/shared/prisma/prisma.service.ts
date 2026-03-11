import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '../../../config/config.service';
import { Prisma, PrismaClient } from '../../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions & {
      log: Array<Prisma.LogLevel | Prisma.LogDefinition>;
    }
  >
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(config: ConfigService) {
    const logger = new Logger(PrismaService.name);

    super({
      adapter: new PrismaPg({
        connectionString: config.get('DATABASE_URL'),
      }),
      log: config.isDevelopment()
        ? [
            {
              emit: 'event',
              level: 'query',
            },
          ]
        : [],
    });

    super.$on('query', logger.debug.bind(logger));
  }

  onApplicationBootstrap(): Promise<void> {
    return this.$connect();
  }

  onApplicationShutdown(): Promise<void> {
    return this.$disconnect();
  }
}
