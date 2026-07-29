import { Controller, Sse, MessageEvent, Req } from '@nestjs/common';
import { StreamService } from './stream.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { filter, finalize, interval, map, merge, Observable } from 'rxjs';
import { Public } from '@iot-manager/nest-libs';

@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @EventPattern('stream.metrics')
  handleLiveMetrics(@Payload() data: any) {
    this.streamService.metrics$.next(data);
  }

  @Sse('events')
  streamGlobalEvents(@Req() req): Observable<MessageEvent> {
    const currentUserId = req.user.id;

    const metricsStream$ = this.streamService.metrics$.pipe(
      filter((payload) => payload.userId === currentUserId),
      map((payload) => ({ type: 'metrics', data: payload })),
    );

    return merge(metricsStream$);
  }
}
