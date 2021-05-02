/* @flow strict-local */
import type { ApiResponseSuccess, Auth } from './transportTypes';
import type { GeneralEvent } from './eventTypes';
import { apiGet } from './apiFetch';

type ApiResponsePollEvents = {|
  ...ApiResponseSuccess,
  events: GeneralEvent[],
|};

/** See https://zulip.com/api/get-events */
export default (auth: Auth, queueId: number, lastEventId: number): Promise<ApiResponsePollEvents> =>
  apiGet(
    auth,
    'events',
    {
      queue_id: queueId,
      last_event_id: lastEventId,
    },
    true,
  );
