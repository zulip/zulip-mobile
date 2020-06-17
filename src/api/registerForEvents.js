/* @flow strict-local */
import type { InitialData } from './initialDataTypes';
import type { Auth } from './transportTypes';
import type { Narrow } from './apiTypes';
import { apiPost } from './apiFetch';

type RegisterForEventsParams = {|
  apply_markdown?: boolean,
  client_gravatar?: boolean,
  all_public_streams?: boolean,
  event_types?: string[],
  fetch_event_types?: string[],
  include_subscribers?: boolean,
  narrow?: Narrow,
  queue_lifespan_secs?: number,
  client_capabilities?: {|
    notification_settings_null: boolean,
    bulk_message_deletion: boolean,
  |},
|};

/** See https://zulip.com/api/register-queue */
export default async (auth: Auth, params: RegisterForEventsParams): Promise<InitialData> => {
  // The use of `...rest` here (rather than just using `...params` below) is to
  // work around a Flow object-spread bug fixed in v0.111.0.
  const { narrow, event_types, fetch_event_types, client_capabilities, ...rest } = params;
  return apiPost(auth, 'register', {
    ...rest,
    narrow: JSON.stringify(narrow),
    event_types: JSON.stringify(event_types),
    fetch_event_types: JSON.stringify(fetch_event_types),
    client_capabilities: JSON.stringify(client_capabilities),
  });
};
