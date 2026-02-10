import { Controller, Get, HttpCode, VERSION_NEUTRAL } from '@nestjs/common';

@Controller({
  version: VERSION_NEUTRAL,
})
export class HealthcheckController {
  @Get('startupz')
  @HttpCode(200)
  startupz(): void {}

  @Get('livez')
  @HttpCode(200)
  livez(): void {}

  @Get('readyz')
  @HttpCode(200)
  readyz(): void {}
}
