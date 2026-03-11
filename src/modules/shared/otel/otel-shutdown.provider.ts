import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { nodeSDK } from '../../../otel-setup';

@Injectable()
export class OtelShutdownProvider implements OnApplicationShutdown {
  async onApplicationShutdown(): Promise<void> {
    return nodeSDK.shutdown();
  }
}
