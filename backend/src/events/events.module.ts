import { Global, Module } from '@nestjs/common'
import EventEmitter2 from 'eventemitter2'

@Global()
@Module({
  providers: [
    {
      provide: EventEmitter2,
      useValue: new EventEmitter2({ wildcard: true, delimiter: '.' }),
    },
  ],
  exports: [EventEmitter2],
})
export class EventsModule {}
