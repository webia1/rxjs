import { Observable } from 'rxjs/internal/Observable';
import { Operation, FOType, Sink, SinkArg, PartialObserver } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { lift } from 'rxjs/internal/util/lift';

export function tap<T>(
  observer: PartialObserver<T>
): Operation<T, T>

export function tap<T>(
  nextHandler?: (value: T) => void,
  errorHandler?: (err: any) => void,
  completeHandler?: () => void,
): Operation<T, T>

export function tap<T>(
  nextOrObserver?: PartialObserver<T>|((value: T) => void),
  errorHandler?: (err: any) => void,
  completeHandler?: () => void,
): Operation<T, T>

export function tap<T>(
  nextOrObserver?: PartialObserver<T>|((value: T) => void),
  errorHandler?: (err: any) => void,
  completeHandler?: () => void,
): Operation<T, T> {
  let nextHandler: (value: T) => void;

  if (nextOrObserver) {
    if (typeof nextOrObserver === 'object') {
      nextHandler = nextOrObserver.next && nextOrObserver.next.bind(nextOrObserver);
      errorHandler = nextOrObserver.error && nextOrObserver.error.bind(nextOrObserver);
      completeHandler = nextOrObserver.complete && nextOrObserver.complete.bind(nextOrObserver);
    } else {
      nextHandler = nextOrObserver;
    }
  }

  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      switch (t) {
        case FOType.NEXT:
          if (nextHandler) nextHandler(v);
          break;
        case FOType.ERROR:
          if (errorHandler) errorHandler(v);
          break;
        case FOType.COMPLETE:
          if (completeHandler) completeHandler();
          break;
        default:
          break;
      }
      dest(t, v, subs);
    }, subs);
  });
}
