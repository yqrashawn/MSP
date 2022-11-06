import { partial } from '@thi.ng/compose';
import { stream, CloseMode } from '@thi.ng/rstream';

export function tosub(fn, errorPrefix = '') {
  return { next: fn, error: partial(console.error, errorPrefix) };
}
export function s(id) {
  return stream({
    id: id,
    closeIn: CloseMode.NEVER,
    closeOut: CloseMode.NEVER,
    cache: true,
  });
}

export function pipe1to2(s1, s2) {
  s1.subscribe(
    tosub(s2.next.bind(s2), 'error from s1 ', s1.id, ' to s2 ', s2.id)
  );
}

export function pipe(...args) {
  if (args.length === 1) {
    const [s2] = args;
    return tosub(s2.next.bind(s2), 'error from s1 to s2 ', s2.id);
  } else if (args.length === 2) {
    return pipe1to2(...args);
  }
}
