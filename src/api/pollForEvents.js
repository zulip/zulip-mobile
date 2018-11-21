/* @flow */
import type { Account } from './apiTypes';
import { apiGet } from './apiFetch';

export default (account: Account, queueId: number, lastEventId: number) =>
  apiGet(
    account,
    'events',
    res => res,
    {
      queue_id: queueId,
      last_event_id: lastEventId,
    },
    true,
  );
