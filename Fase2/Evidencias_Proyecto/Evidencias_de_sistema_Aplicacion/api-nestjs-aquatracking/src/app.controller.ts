import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


  @Get('server-session')
  getServerSession(): { serverSessionId: string } {
    return {
      serverSessionId: this.appService.getServerSessionId(),
    };
  }
}
