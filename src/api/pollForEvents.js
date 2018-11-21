/* @flow */
import type { Account } from './apiTypes';
import { apiGet } from './apiFetch';

export default (auth: Account, queueId: number, lastEventId: number) =>
  apiGet(
    auth,
    'events',
    res => res,
    {
      queue_id: queueId,
      last_event_id: lastEventId,
    },
    true,
  );
