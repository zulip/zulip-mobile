/* @flow strict-local */
import type { Auth } from './transportTypes';
import type { Narrow } from './apiTypes';
import { apiPost, objectToParams } from './apiFetch';

type RegisterForEventsParams = {|
  apply_markdown?: boolean,
  client_gravatar?: boolean,
  all_public_streams?: boolean,
  event_types?: string[],
  fetch_event_types?: string[],
  include_subscribers?: boolean,
  narrow?: Narrow,
  queue_lifespan_secs?: number,
|};

/** See https://zulipchat.com/api/register-queue */
export default (auth: Auth, params: RegisterForEventsParams) =>
  apiPost(auth, 'register', objectToParams(params));
