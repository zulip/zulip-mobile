/* @flow strict-local */
import type { Auth } from './apiTypes';
import { apiGet } from './apiFetch';

/** See https://zulipchat.com/api/get-events-from-queue */
export default (auth: Auth, queueId: number, lastEventId: number) =>
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
