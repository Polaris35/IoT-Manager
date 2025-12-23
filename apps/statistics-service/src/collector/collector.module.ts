import { Module } from '@nestjs/common';
import { CollectorController } from './collector.controller';

@Module({
  controllers: [CollectorController],
})
export class CollectorModule {}
