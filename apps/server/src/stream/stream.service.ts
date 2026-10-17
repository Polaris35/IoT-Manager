import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class StreamService {
  readonly metrics$ = new Subject<any>();
}
