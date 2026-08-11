import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { StreamService } from './stream.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { filter, map, merge, Observable } from 'rxjs';
import { CurrentUser } from '@iot-manager/nest-libs';

@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @EventPattern('stream.metrics')
  handleLiveMetrics(@Payload() data: any) {
    this.streamService.metrics$.next(data);
  }

  @Sse('events')
  streamGlobalEvents(
    @CurrentUser('id') currentUserId: string,
  ): Observable<MessageEvent> {
    const metricsStream$ = this.streamService.metrics$.pipe(
      filter((payload) => payload.userId === currentUserId),
      map((payload) => ({ type: 'metrics', data: payload })),
    );

    return merge(metricsStream$);
  }
}
