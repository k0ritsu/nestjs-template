import { Module } from '@nestjs/common';
import { CONFIG } from './config.constants';
import { ConfigSchema } from './config.schema';
import { ConfigService } from './config.service';

@Module({
  providers: [
    {
      provide: CONFIG,
      useValue: ConfigSchema.parse(process.env),
    },
    ConfigService,
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
