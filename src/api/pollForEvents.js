import { apiGet, Auth } from './apiFetch';

export default (auth: Auth, queueId: number, lastEventId: number) =>
  apiGet(
    auth,
    'events',
    {
      queue_id: queueId,
      last_event_id: lastEventId,
    },
    res => res,
    true,
  );
