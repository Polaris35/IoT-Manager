import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { TokenToHeaderMiddleware } from './token-to-header.middleware.ts';

@Module({
  controllers: [StreamController],
  providers: [StreamService],
})
export class StreamModule implements NestModule {
  //TODO: Remove once the cookie auth is implemented
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenToHeaderMiddleware).forRoutes('stream/events');
  }
}
