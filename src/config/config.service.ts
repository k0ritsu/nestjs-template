import { Inject, Injectable } from '@nestjs/common';
import { CONFIG } from './config.constants';
import { type Config } from './config.schema';

@Injectable()
export class ConfigService {
  constructor(@Inject(CONFIG) private readonly config: Config) {}

  get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }
}
