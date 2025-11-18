import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('RealtimeGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitNewMeasurement(measurement: any) {
    const flowRate = measurement.durationSec > 0 
      ? (measurement.liters / measurement.durationSec) * 60 
      : 0;

    this.server.emit('newMeasurement', {
      sensorId: measurement.sensorId,
      homeId: measurement.homeId,
      liters: measurement.liters,
      flowRate: Math.round(flowRate * 100) / 100,
      durationSec: measurement.durationSec,
      startTime: measurement.startTime,
      endTime: measurement.endTime,
      action: measurement.liters > 0 ? 'close' : 'open',
    });
  }

  emitNewDailyData(data: any) {
    this.server.emit('newDailyData', data);
  }

  emitAlert(data: any) {
    this.server.emit('newAlert', data);
  }
}
