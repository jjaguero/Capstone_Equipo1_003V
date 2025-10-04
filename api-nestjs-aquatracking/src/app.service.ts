import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class AppService {
  private readonly serverSessionId: string = randomUUID();

  getHello(): string {
    return 'Hello World!';
  }


  getServerSessionId(): string {
    return this.serverSessionId;
  }
}
